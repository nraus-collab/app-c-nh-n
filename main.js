const { app, BrowserWindow, shell } = require('electron');
const http = require('http'), fs = require('fs'), path = require('path');

// Cổng CỐ ĐỊNH: giữ nguyên "origin" nên dữ liệu (localStorage) không mất khi mở lại app,
// và YouTube nhúng được (YouTube từ chối trang mở bằng file://).
const PORT = 47321;
if (!app.requestSingleInstanceLock()) app.quit();

function startServer() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) { res.writeHead(500); return res.end('Error'); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    });
    srv.once('error', reject);
    srv.listen(PORT, '127.0.0.1', resolve);
  });
}

async function createWindow() {
  await startServer();
  const win = new BrowserWindow({
    width: 1200, height: 800, minWidth: 380, minHeight: 600,
    backgroundColor: '#07070a', autoHideMenuBar: true, title: 'HAR HUB',
    webPreferences: { contextIsolation: true }
  });
  win.loadURL(`http://127.0.0.1:${PORT}/`);
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(createWindow).catch(() => app.quit());
app.on('window-all-closed', () => app.quit());
