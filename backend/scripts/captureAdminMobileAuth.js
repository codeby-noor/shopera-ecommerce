const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9232;
const USER_DATA_DIR = 'C:\\Users\\mahen\\.gemini\\antigravity-ide\\brain\\bf88ca2c-6121-40d8-bc5a-c9d0eca91864\\chrome_profile_admin_mobile_auth';
const SCREENSHOTS_DIR = 'C:\\Users\\mahen\\.gemini\\antigravity-ide\\brain\\bf88ca2c-6121-40d8-bc5a-c9d0eca91864\\screenshots_mobile';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          if (parsed.id && this.callbacks.has(parsed.id)) {
            const cb = this.callbacks.get(parsed.id);
            this.callbacks.delete(parsed.id);
            if (parsed.error) cb.reject(parsed.error);
            else cb.resolve(parsed.result);
          }
        } catch (e) {}
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(res.data, 'base64'));
    return fullPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function captureAdminAuth() {
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${REMOTE_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    'about:blank'
  ]);

  try {
    await sleep(2500);
    const pages = await httpGetJson(`http://127.0.0.1:${REMOTE_PORT}/json/list`);
    const client = new CDPClient(pages[0].webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    // 1. Login as Admin
    await client.send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(1500);

    await client.evaluate(`
      (() => {
        const demoAdminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Admin'));
        if (demoAdminBtn) demoAdminBtn.click();
      })()
    `);
    await sleep(300);

    await client.evaluate(`
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(2000);

    // 2. Set mobile viewport 375px
    await client.setViewport(375, 812, true);

    // 3. Admin Dashboard
    await client.send('Page.navigate', { url: 'http://localhost:3000/admin' });
    await sleep(1500);

    const shotAdminDash = await client.captureScreenshot('screenshot_admin_dashboard_auth_375px.png');
    console.log('✅ Admin Dashboard Authenticated 375px:', shotAdminDash);

    // 4. Admin Coupons
    await client.send('Page.navigate', { url: 'http://localhost:3000/admin/coupons' });
    await sleep(1500);

    const shotAdminCoupons = await client.captureScreenshot('screenshot_admin_coupons_auth_375px.png');
    console.log('✅ Admin Coupons Authenticated 375px:', shotAdminCoupons);

    client.close();
  } finally {
    chromeProc.kill();
  }
}

captureAdminAuth();
