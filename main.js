const { app, BrowserWindow, globalShortcut, ipcMain, dialog, shell, systemPreferences } = require('electron');
const path = require('path');
const { Player } = require('./player');
const { SONGS } = require('./songs');

let mainWindow = null;
let player = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 640,
    minWidth: 420,
    minHeight: 520,
    backgroundColor: '#000000',
    title: 'Roblox Piano Hotkey',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function sendStatus(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('player-status', payload);
  }
}

function startSelectedSong(songId, options = {}) {
  if (!player) return { ok: false, error: 'Player not ready' };
  const song = SONGS.find((s) => s.id === songId);
  if (!song) return { ok: false, error: 'Song not found' };

  try {
    player.play(song, {
      humanize: !!options.humanize,
      speed: Number(options.speed) || 1,
      onStatus: sendStatus,
    });
    return { ok: true, title: song.title };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

function stopPlayback() {
  if (player) player.stop();
  sendStatus({ state: 'stopped', progress: 0, noteIndex: 0, total: 0 });
  return { ok: true };
}

app.whenReady().then(() => {
  player = new Player();
  createWindow();

  const fireStart = () => {
    if (mainWindow) mainWindow.webContents.send('hotkey-start');
  };
  const fireStop = () => {
    stopPlayback();
    if (mainWindow) mainWindow.webContents.send('hotkey-stop');
  };

  // = start / - stop (global; needs Accessibility on macOS)
  const shortcuts = {
    start: ['=', 'Shift+=', 'numadd'],
    stop: ['-', 'numsub'],
  };
  for (const key of shortcuts.start) {
    try { globalShortcut.register(key, fireStart); } catch (_) {}
  }
  for (const key of shortcuts.stop) {
    try { globalShortcut.register(key, fireStop); } catch (_) {}
  }

  // Check accessibility on macOS and notify renderer
  if (process.platform === 'darwin') {
    const trusted = systemPreferences.isTrustedAccessibilityClient(false);
    if (!trusted) {
      // Prompt on launch — gives user the native macOS dialog
      systemPreferences.isTrustedAccessibilityClient(true);
    }
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(
          'accessibility-status',
          systemPreferences.isTrustedAccessibilityClient(false)
        );
      }
    }, 1500);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (player) player.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-songs', () =>
  SONGS.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    genre: s.genre,
    bpm: s.bpm,
    durationMs: s.durationMs || estimateDuration(s),
  }))
);

ipcMain.handle('play-song', (_e, songId, options) => startSelectedSong(songId, options || {}));
ipcMain.handle('stop-song', () => stopPlayback());
ipcMain.handle('get-status', () => (player ? player.getStatus() : { state: 'idle' }));

ipcMain.handle('get-song-notes', (_e, songId) => {
  const song = SONGS.find((s) => s.id === songId);
  return song && Array.isArray(song.notes) ? song.notes : [];
});

ipcMain.handle('open-accessibility', async () => {
  if (process.platform === 'darwin') {
    await shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
    );
  }
  return { ok: true };
});

ipcMain.handle('check-accessibility', () => {
  if (process.platform === 'darwin') {
    return { trusted: systemPreferences.isTrustedAccessibilityClient(false) };
  }
  return { trusted: true };
});

ipcMain.handle('prompt-accessibility', () => {
  if (process.platform === 'darwin') {
    systemPreferences.isTrustedAccessibilityClient(true);
    return { trusted: systemPreferences.isTrustedAccessibilityClient(false) };
  }
  return { trusted: true };
});

ipcMain.handle('test-key', async (_e, key) => {
  try {
    player.tapKey(key || 'a');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
});

function estimateDuration(song) {
  if (!song.notes || !song.notes.length) return 0;
  return song.notes.reduce((sum, n) => sum + (n.d || 0), 0);
}
