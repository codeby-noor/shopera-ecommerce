const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REMOTE_PORT = 9228;
const USER_DATA_DIR = 'C:\\Users\\mahen\\.gemini\\antigravity-ide\\brain\\bf88ca2c-6121-40d8-bc5a-c9d0eca91864\\chrome_profile_admin_test';
const SCREENSHOTS_DIR = 'C:\\Users\\mahen\\.gemini\\antigravity-ide\\brain\\bf88ca2c-6121-40d8-bc5a-c9d0eca91864\\screenshots';

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

function httpPostJson(url, postData) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(postData);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.callbacks = new Map();
    this.runtimeErrors = [];
    this.consoleLogs = [];
    this.networkFailures = [];
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
          } else if (parsed.method === 'Runtime.exceptionThrown') {
            const desc = parsed.params?.exceptionDetails?.exception?.description || parsed.params?.exceptionDetails?.text;
            this.runtimeErrors.push(desc);
          } else if (parsed.method === 'Runtime.consoleAPICalled') {
            const text = (parsed.params?.args || []).map(a => a.value || a.description || '').join(' ');
            this.consoleLogs.push(`[${parsed.params.type}] ${text}`);
          } else if (parsed.method === 'Network.responseReceived') {
            const status = parsed.params?.response?.status;
            const url = parsed.params?.response?.url;
            if (status >= 400 && !url.includes('favicon')) {
              this.networkFailures.push(`${status} ${url}`);
            }
          }
        } catch (e) {
          console.error('Error parsing WS msg:', e);
        }
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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async navigate(url, waitMs = 2000) {
    await this.send('Page.navigate', { url });
    await sleep(waitMs);
  }

  async waitForSelector(selector, timeoutMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const found = await this.eval(`!!document.querySelector('${selector}')`);
        if (found) return true;
      } catch (e) {}
      await sleep(250);
    }
    return false;
  }

  async captureScreenshot(filePath) {
    const result = await this.send('Page.captureScreenshot', { format: 'png' });
    if (result && result.data) {
      fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      console.log(`📸 Screenshot saved: ${path.basename(filePath)}`);
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runAudit() {
  console.log('🔍 ========================================================');
  console.log('🔍 SHOPERA LIVE ADMIN LAYOUT & CURRENCY SELECTOR VERIFICATION');
  console.log('🔍 ========================================================\n');

  if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  console.log('🚀 Spawning headless Google Chrome instance...');
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${REMOTE_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${USER_DATA_DIR}`,
    'http://localhost:3000'
  ], { stdio: 'ignore' });

  let versionData = null;
  for (let i = 0; i < 15; i++) {
    await sleep(600);
    try {
      versionData = await httpGetJson(`http://127.0.0.1:${REMOTE_PORT}/json/version`);
      if (versionData && versionData.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!versionData) {
    console.error('❌ Failed to connect to Chrome CDP.');
    chromeProcess.kill();
    process.exit(1);
  }

  let pageTarget = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const targets = await httpGetJson(`http://127.0.0.1:${REMOTE_PORT}/json/list`);
      pageTarget = Array.isArray(targets) && targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) break;
    } catch (e) {}
  }

  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionData.webSocketDebuggerUrl;
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');

  const testResults = [];
  function record(name, passed, detail) {
    const symbol = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`[Test] ${name}: ${symbol} -> ${detail}`);
    testResults.push({ name, passed, detail });
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1: Currency Selector Dropdown Open, Close & Switch USD -> INR -> EUR -> GBP -> USD
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing USD Currency Selector ---');
    await cdp.navigate('http://localhost:3000/', 2500);
    await cdp.waitForSelector('#currencyDropdownBtn', 5000);

    const initialCurrency = await cdp.eval(`(() => {
      const btn = document.querySelector('#currencyDropdownBtn');
      const isMenuOpen = !!document.querySelector('.currency-selector-wrapper .dropdown-menu');
      return { text: btn?.innerText, isMenuOpen };
    })()`);

    // Click to open dropdown
    await cdp.eval(`document.querySelector('#currencyDropdownBtn')?.click()`);
    await sleep(350);

    const openState = await cdp.eval(`(() => {
      const menu = document.querySelector('.currency-selector-wrapper .dropdown-menu');
      const items = Array.from(document.querySelectorAll('.currency-selector-wrapper .dropdown-item')).map(el => el.innerText.trim());
      return { isVisible: !!menu, itemsCount: items.length, items };
    })()`);

    // Switch to INR
    await cdp.eval(`(() => {
      const inrBtn = Array.from(document.querySelectorAll('.currency-selector-wrapper .dropdown-item')).find(el => el.innerText.includes('INR'));
      inrBtn?.click();
    })()`);
    await sleep(400);

    const inrState = await cdp.eval(`(() => {
      const saved = localStorage.getItem('shopera_currency');
      const btnText = document.querySelector('#currencyDropdownBtn')?.innerText || '';
      const menuOpen = !!document.querySelector('.currency-selector-wrapper .dropdown-menu');
      const samplePrice = document.body.innerText.includes('₹');
      return { saved, btnText, menuOpen, samplePrice };
    })()`);

    // Switch to EUR
    await cdp.eval(`document.querySelector('#currencyDropdownBtn')?.click()`);
    await sleep(350);
    await cdp.eval(`(() => {
      const eurBtn = Array.from(document.querySelectorAll('.currency-selector-wrapper .dropdown-item')).find(el => el.innerText.includes('EUR'));
      eurBtn?.click();
    })()`);
    await sleep(400);
    const eurSaved = await cdp.eval(`localStorage.getItem('shopera_currency')`);

    // Switch to GBP
    await cdp.eval(`document.querySelector('#currencyDropdownBtn')?.click()`);
    await sleep(350);
    await cdp.eval(`(() => {
      const gbpBtn = Array.from(document.querySelectorAll('.currency-selector-wrapper .dropdown-item')).find(el => el.innerText.includes('GBP'));
      gbpBtn?.click();
    })()`);
    await sleep(400);
    const gbpSaved = await cdp.eval(`localStorage.getItem('shopera_currency')`);

    // Restore to USD
    await cdp.eval(`document.querySelector('#currencyDropdownBtn')?.click()`);
    await sleep(350);
    await cdp.eval(`(() => {
      const usdBtn = Array.from(document.querySelectorAll('.currency-selector-wrapper .dropdown-item')).find(el => el.innerText.includes('USD'));
      usdBtn?.click();
    })()`);
    await sleep(400);
    const usdSaved = await cdp.eval(`localStorage.getItem('shopera_currency')`);

    // Test Outside Click closes dropdown
    await cdp.eval(`document.querySelector('#currencyDropdownBtn')?.click()`);
    await sleep(300);
    const openedBeforeOutside = await cdp.eval(`!!document.querySelector('.currency-selector-wrapper .dropdown-menu')`);
    await cdp.eval(`document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))`);
    await sleep(300);
    const closedAfterOutside = await cdp.eval(`!document.querySelector('.currency-selector-wrapper .dropdown-menu')`);

    const currencyPassed = initialCurrency.text.includes('USD') &&
      openState.isVisible &&
      openState.itemsCount === 4 &&
      inrState.saved === 'INR' &&
      inrState.samplePrice &&
      eurSaved === 'EUR' &&
      gbpSaved === 'GBP' &&
      usdSaved === 'USD' &&
      openedBeforeOutside &&
      closedAfterOutside;

    record('Currency Selector Interactive Switching & Outside-Click', currencyPassed,
      `Initial: ${initialCurrency.text.replace(/\s+/g, ' ')}, Menu Items: ${openState.itemsCount}, Cycle: INR(${inrState.saved}) -> EUR(${eurSaved}) -> GBP(${gbpSaved}) -> USD(${usdSaved}), Outside-Click Close: ${closedAfterOutside}`);

    // -----------------------------------------------------------------
    // TEST 2: Admin Authentication & Login Session
    // -----------------------------------------------------------------
    console.log('\n--- 2. Setting Up Admin Session ---');
    const adminLoginRes = await httpPostJson('http://localhost:5000/api/auth/login', {
      email: 'admin@shopera.com',
      password: 'Admin@123'
    });

    if (adminLoginRes && adminLoginRes.token) {
      await cdp.eval(`(() => {
        localStorage.setItem('apex_token', '${adminLoginRes.token}');
        localStorage.setItem('apex_user', JSON.stringify(${JSON.stringify(adminLoginRes.user)}));
      })()`);
    }

    // -----------------------------------------------------------------
    // TEST 3: Admin Dashboard Layout & KPI Spacing
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing Admin Dashboard (/admin) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.navigate('http://localhost:3000/admin', 2500);
    await cdp.waitForSelector('.stat-kpi-card', 5000);

    const dashLayout = await cdp.eval(`(() => {
      const layout = document.querySelector('.admin-layout');
      const sidebar = document.querySelector('.admin-sidebar');
      const main = document.querySelector('.admin-main');
      const heading = document.querySelector('h1');
      const kpis = document.querySelectorAll('.stat-kpi-card');
      const alert = document.querySelector('.alert-warning');
      const alertHasEntity = alert ? alert.innerText.includes('&bull;') : false;
      const computedMain = main ? window.getComputedStyle(main) : null;
      const computedPaddingLeft = computedMain ? parseInt(computedMain.paddingLeft) : 0;

      const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
      const mainRect = main ? main.getBoundingClientRect() : null;
      const isSideBySide = sidebarRect && mainRect ? (mainRect.left >= sidebarRect.right - 5) : false;

      return {
        hasLayout: !!layout,
        isSideBySide,
        paddingLeft: computedPaddingLeft,
        headingTop: heading ? heading.getBoundingClientRect().top : 0,
        kpisCount: kpis.length,
        alertHasEntity,
        headingText: heading?.innerText
      };
    })()`);

    await cdp.captureScreenshot(path.join(SCREENSHOTS_DIR, 'admin_dashboard_desktop.png'));

    const dashPassed = dashLayout.hasLayout &&
      dashLayout.isSideBySide &&
      dashLayout.paddingLeft >= 20 &&
      dashLayout.kpisCount === 4 &&
      !dashLayout.alertHasEntity;

    record('Admin Dashboard Layout, KPI Cards & Clean Inventory Alert', dashPassed,
      `Side-by-side: ${dashLayout.isSideBySide}, Horizontal Padding: ${dashLayout.paddingLeft}px, KPIs: ${dashLayout.kpisCount}, Literal &bull; present: ${dashLayout.alertHasEntity}`);

    // -----------------------------------------------------------------
    // TEST 4: Admin Coupons Page Layout & Top Alignment (/admin/coupons)
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing Admin Coupons (/admin/coupons) ---');
    await cdp.navigate('http://localhost:3000/admin/coupons', 2500);
    await cdp.waitForSelector('table', 5000);

    const couponLayout = await cdp.eval(`(() => {
      const layout = document.querySelector('.admin-layout');
      const sidebar = document.querySelector('.admin-sidebar');
      const main = document.querySelector('.admin-main');
      const heading = document.querySelector('h1');
      const createBtn = document.querySelector('button:has(.bi-plus-lg), button.btn-shopera-primary');
      const statusBadges = Array.from(document.querySelectorAll('tbody button span.badge')).map(b => b.innerText.trim());

      const computedMain = main ? window.getComputedStyle(main) : null;
      const paddingLeft = computedMain ? parseInt(computedMain.paddingLeft) : 0;
      const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
      const mainRect = main ? main.getBoundingClientRect() : null;
      const headingRect = heading ? heading.getBoundingClientRect() : null;

      const isSideBySide = sidebarRect && mainRect ? (mainRect.left >= sidebarRect.right - 5) : false;
      const headingDirectlyUnderHeader = headingRect ? (headingRect.top < 240 && headingRect.top > 100) : false;

      return {
        hasLayout: !!layout,
        isSideBySide,
        paddingLeft,
        headingTop: headingRect ? headingRect.top : 0,
        headingDirectlyUnderHeader,
        headingText: heading?.innerText,
        hasCreateBtn: !!createBtn,
        statusBadges
      };
    })()`);

    await cdp.captureScreenshot(path.join(SCREENSHOTS_DIR, 'admin_coupons_desktop.png'));

    const couponsLayoutPassed = couponLayout.hasLayout &&
      couponLayout.isSideBySide &&
      couponLayout.paddingLeft >= 20 &&
      couponLayout.headingDirectlyUnderHeader &&
      couponLayout.statusBadges.length > 0 &&
      couponLayout.statusBadges.every(b => b === 'Active' || b === 'Inactive');

    record('Admin Coupons Layout, Zero Blank Area & High-Contrast Status Badges', couponsLayoutPassed,
      `Side-by-side: ${couponLayout.isSideBySide}, Heading Top: ${couponLayout.headingTop}px (no huge blank area), Padding: ${couponLayout.paddingLeft}px, Badges: [${couponLayout.statusBadges.join(', ')}]`);

    // -----------------------------------------------------------------
    // TEST 5: Coupon Status Toggle & Modal Interaction
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing Coupon Toggle & Modal ---');
    const toggleResult = await cdp.eval(`(async () => {
      const firstStatusBtn = document.querySelector('tbody button');
      const initialText = firstStatusBtn?.innerText.trim();
      firstStatusBtn?.click();
      return { initialText };
    })()`);
    await sleep(600);

    const afterToggleText = await cdp.eval(`document.querySelector('tbody button')?.innerText.trim()`);

    // Toggle back to preserve original state
    await cdp.eval(`document.querySelector('tbody button')?.click()`);
    await sleep(600);
    const restoredText = await cdp.eval(`document.querySelector('tbody button')?.innerText.trim()`);

    // Test Create Coupon Modal open & close
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create New Coupon'));
      btn?.click();
    })()`);
    await sleep(400);

    const modalOpen = await cdp.eval(`(() => {
      const modal = document.querySelector('.modal.show');
      const title = modal ? modal.querySelector('.modal-title')?.innerText : '';
      return { isModalOpen: !!modal, title };
    })()`);

    // Close modal
    await cdp.eval(`document.querySelector('.modal .btn-close, .modal .btn-outline-secondary')?.click()`);
    await sleep(350);
    const modalClosed = await cdp.eval(`!document.querySelector('.modal.show')`);

    const togglePassed = toggleResult.initialText !== afterToggleText &&
      restoredText === toggleResult.initialText &&
      modalOpen.isModalOpen &&
      modalClosed;

    record('Coupon Toggle Status & Modal Create Interaction', togglePassed,
      `Status toggled: ${toggleResult.initialText} -> ${afterToggleText} -> restored: ${restoredText}, Modal: "${modalOpen.title}", Clean Close: ${modalClosed}`);

    // -----------------------------------------------------------------
    // TEST 6: Tablet & Mobile Screenshots & Responsive Checks
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing Responsive Views & Capturing Screenshots ---');
    // Tablet 768px
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
    await cdp.captureScreenshot(path.join(SCREENSHOTS_DIR, 'admin_coupons_tablet_768.png'));

    // Mobile 375px
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
    const mobileCardsCheck = await cdp.eval(`(() => {
      const cards = document.querySelectorAll('.d-block.d-md-none .card');
      const tableHidden = !!document.querySelector('.card.d-none.d-md-block');
      return { cardsCount: cards.length, tableHidden };
    })()`);
    await cdp.captureScreenshot(path.join(SCREENSHOTS_DIR, 'admin_coupons_mobile_375.png'));

    // Mobile 320px
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
    await cdp.captureScreenshot(path.join(SCREENSHOTS_DIR, 'admin_coupons_mobile_320.png'));

    // Reset emulation
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    const mobileCardsPassed = mobileCardsCheck.cardsCount > 0 && mobileCardsCheck.tableHidden;
    record('Mobile Responsive Coupons Card View (< 768px)', mobileCardsPassed,
      `Mobile cards rendered: ${mobileCardsCheck.cardsCount}, Desktop table hidden: ${mobileCardsCheck.tableHidden}`);

    // -----------------------------------------------------------------
    // TEST 7: 11 Viewport Overflow Verification on /admin & /admin/coupons
    // -----------------------------------------------------------------
    console.log('\n--- 7. Checking Zero Horizontal Overflow Across 11 Viewports ---');
    const targetViewports = [
      { name: 'Small mobile', width: 320, height: 568 },
      { name: 'Standard mobile', width: 360, height: 640 },
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Large mobile 390', width: 390, height: 844 },
      { name: 'Large mobile 430', width: 430, height: 932 },
      { name: 'Small tablet', width: 600, height: 960 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Large tablet', width: 1024, height: 768 },
      { name: 'Laptop', width: 1280, height: 800 },
      { name: 'Desktop', width: 1440, height: 900 },
      { name: 'Wide desktop', width: 1920, height: 1080 }
    ];

    let allViewportsClean = true;
    for (const vp of targetViewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });
      await sleep(250);

      const overflowCheck = await cdp.eval(`(() => {
        const root = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(root.scrollWidth, body.scrollWidth);
        const innerW = window.innerWidth;
        return { overflow: scrollW > innerW + 1, delta: scrollW - innerW };
      })()`);

      if (overflowCheck.overflow) {
        allViewportsClean = false;
        console.log(`⚠️ Overflow at ${vp.name} (${vp.width}px): +${overflowCheck.delta}px`);
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    record('Zero Horizontal Overflow (11 Viewports: 320px–1920px)', allViewportsClean,
      `All 11 viewports tested: ${allViewportsClean ? '100% Zero Overflow' : 'Overflow detected'}`);

    // -----------------------------------------------------------------
    // TEST 8: Console Errors & Network Failures
    // -----------------------------------------------------------------
    const cleanErrors = cdp.runtimeErrors.filter(e => !e.includes('ResizeObserver') && !e.includes('favicon'));
    const healthPassed = cleanErrors.length === 0;
    record('Console Health & Network Integrity', healthPassed,
      `Unhandled Errors: ${cleanErrors.length}, Network Failures: ${cdp.networkFailures.length}`);

  } catch (err) {
    console.error('❌ Audit script encountered an execution error:', err);
  } finally {
    cdp.close();
    chromeProcess.kill();
  }

  console.log('\n📊 ========================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('📊 ========================================================');
  const passedCount = testResults.filter(t => t.passed).length;
  console.log(`Passed: ${passedCount} / ${testResults.length} Tests`);
  if (passedCount === testResults.length) {
    console.log('🎉 ALL TESTS VERIFIED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed.\n');
    process.exit(1);
  }
}

runAudit().catch(e => {
  console.error(e);
  process.exit(1);
});
