const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let pool = null;
let isConnected = false;

/**
 * Configure secure TLS settings compatible with TiDB Cloud Starter / Serverless
 * and other managed MySQL cloud services.
 * Strict certificate verification is preserved (rejectUnauthorized: true).
 * Certificate verification is never disabled merely to bypass errors.
 */
function getSslConfig(host = '') {
  const sslEnv = process.env.DB_SSL || process.env.TIDB_SSL;

  // Allow explicit disable only if DB_SSL is explicitly false/0/off/disable (e.g. local MySQL)
  if (sslEnv) {
    const val = sslEnv.toLowerCase().trim();
    if (val === 'false' || val === '0' || val === 'off' || val === 'disable') {
      return undefined;
    }
  }

  const isTiDB = typeof host === 'string' && (host.includes('tidbcloud.com') || host.includes('tidb'));
  const isExplicitSsl = sslEnv && ['true', '1', 'on', 'require'].includes(sslEnv.toLowerCase().trim());
  const isRemoteHost = host && host !== 'localhost' && host !== '127.0.0.1';
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

  // TiDB Cloud requires TLS 1.2+ with valid certificates
  if (isTiDB || isExplicitSsl || (isRemoteHost && isProduction)) {
    const sslConfig = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true // Secure certificate verification compatible with TiDB Cloud public CAs
    };

    const caPathOrValue = process.env.DB_SSL_CA || process.env.TIDB_SSL_CA;
    if (caPathOrValue) {
      if (fs.existsSync(caPathOrValue)) {
        sslConfig.ca = fs.readFileSync(caPathOrValue, 'utf8');
      } else {
        sslConfig.ca = caPathOrValue;
      }
    }

    return sslConfig;
  }

  // Support JSON-formatted SSL configuration if provided
  if (sslEnv) {
    try {
      const parsed = JSON.parse(sslEnv);
      return {
        minVersion: 'TLSv1.2',
        ...parsed,
        rejectUnauthorized: true // Enforce strict certificate verification
      };
    } catch {
      return {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      };
    }
  }

  return undefined;
}

/**
 * Resolve database configuration parameters from environment variables
 * (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
 * or optional connection strings.
 */
function getDatabaseConfig() {
  let dbHost = process.env.DB_HOST || process.env.TIDB_HOST || 'localhost';
  let dbPort = parseInt(process.env.DB_PORT || process.env.TIDB_PORT, 10) || (dbHost.includes('tidbcloud.com') ? 4000 : 3306);
  let dbUser = process.env.DB_USER || process.env.TIDB_USER || 'root';
  let dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.TIDB_PASSWORD !== undefined ? process.env.TIDB_PASSWORD : '');
  let dbName = process.env.DB_NAME || process.env.TIDB_DATABASE || 'shopera';

  // Support connection URL if provided
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.TIDB_URL;
  if (connectionUrl) {
    try {
      const parsedUrl = new URL(connectionUrl);
      dbHost = parsedUrl.hostname || dbHost;
      dbPort = parseInt(parsedUrl.port, 10) || dbPort;
      dbUser = decodeURIComponent(parsedUrl.username) || dbUser;
      dbPassword = decodeURIComponent(parsedUrl.password) || dbPassword;
      if (parsedUrl.pathname && parsedUrl.pathname.length > 1) {
        dbName = parsedUrl.pathname.substring(1) || dbName;
      }
    } catch (urlErr) {
      console.warn('⚠️ [Database Notice] Could not parse connection URL, using individual DB_* variables:', urlErr.message);
    }
  }

  const sslConfig = getSslConfig(dbHost);

  return {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    queueLimit: 0,
    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  };
}

/**
 * Safe, non-destructive table initialization in the selected SHOPERA database.
 * Creates the required SHOPERA tables if they do not exist.
 * Does not attempt to create the database from the application.
 */
async function initSchema(connectionPool) {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const rawSql = fs.readFileSync(schemaPath, 'utf8');

    // Split and filter statements, completely ignoring CREATE DATABASE and USE
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (!s) return false;
        const clean = s.replace(/--.*$/gm, '').trim();
        return clean.length > 0 &&
          !clean.toLowerCase().startsWith('create database') &&
          !clean.toLowerCase().startsWith('use ');
      });

    for (const stmt of statements) {
      const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
      if (cleanStmt) {
        await connectionPool.query(cleanStmt);
      }
    }
  }

  // Idempotent column additions for non-destructive migrations
  const safeAlter = async (sql) => {
    try {
      await connectionPool.query(sql);
    } catch (e) {
      // 1060 / ER_DUP_FIELDNAME is expected if column already exists
      if (e.code !== 'ER_DUP_FIELDNAME' && e.errno !== 1060) {
        // Silently skip if column already exists
      }
    }
  };

  await safeAlter('ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL AFTER category_id');
  await safeAlter('ALTER TABLE products ADD COLUMN variants TEXT NULL AFTER specifications');
  await safeAlter('ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL AFTER status');
  await safeAlter('ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER coupon_code');
  await safeAlter("ALTER TABLE orders ADD COLUMN shipping_tier VARCHAR(30) DEFAULT 'standard'");
  await safeAlter('ALTER TABLE reviews ADD COLUMN is_verified_purchase TINYINT(1) DEFAULT 0');
}

/**
 * Connect to MySQL / TiDB Cloud using a connection pool.
 * Does not fall back to SQLite or local databases in production.
 */
async function connectDatabase() {
  if (pool && isConnected) {
    return pool;
  }

  const config = getDatabaseConfig();
  console.log(`🔍 [Database] Connecting to MySQL/TiDB at ${config.host}:${config.port}/${config.database} (SSL: ${config.ssl ? 'TLS Enabled [Strict Verification]' : 'Disabled'})...`);

  try {
    // Create connection pool directly targeting the specified database
    pool = mysql.createPool(config);

    // Verify connectivity with a quick test connection
    const testConnection = await pool.getConnection();
    testConnection.release();

    // Verify and ensure SHOPERA tables exist without modifying existing data or attempting database creation
    await initSchema(pool);

    isConnected = true;
    console.log(`✅ [Database] Successfully connected to live MySQL/TiDB database '${config.database}' on ${config.host}:${config.port}`);
    return pool;
  } catch (err) {
    isConnected = false;
    pool = null;

    console.error(`❌ [Database Error] Failed to connect to MySQL/TiDB database '${config.database}' at ${config.host}:${config.port}`);
    console.error(`   Message: ${err.message || err.code || 'Could not establish connection'}`);
    console.error(`   Code:    ${err.code || 'UNKNOWN'}`);
    console.error(`\n📋 TiDB Cloud Troubleshooting Checklist:`);
    console.error(`   1. Verify your TiDB Cloud Starter cluster is Active in the TiDB Cloud console.`);
    console.error(`   2. Check DB_HOST (e.g., gateway01.us-east-1.prod.aws.tidbcloud.com) and DB_PORT (usually 4000).`);
    console.error(`   3. Check DB_USER (format: <prefix>.root) and DB_PASSWORD.`);
    console.error(`   4. Ensure the database '${config.database}' exists in your TiDB cluster.`);
    console.error(`   5. Verify network access / IP Allowlist (0.0.0.0/0 allowed on TiDB Cloud for Render).\n`);

    throw err;
  }
}

// Proxied query, execute, and transaction methods
const db = {
  query: async (sql, params = []) => {
    const currentPool = await connectDatabase();
    return currentPool.query(sql, params);
  },
  execute: async (sql, params = []) => {
    const currentPool = await connectDatabase();
    return currentPool.execute(sql, params);
  },
  getConnection: async () => {
    const currentPool = await connectDatabase();
    return currentPool.getConnection();
  },
  getEngine: () => (isConnected ? 'mysql' : 'disconnected'),
  isFallback: () => false,
  connect: connectDatabase,
  close: async () => {
    if (pool) {
      await pool.end();
      pool = null;
      isConnected = false;
    }
  }
};

module.exports = db;
