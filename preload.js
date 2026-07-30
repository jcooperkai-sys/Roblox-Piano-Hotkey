const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pianoAPI', {
  getSongs: () => ipcRenderer.invoke('get-songs'),
  getSongNotes: (songId) => ipcRenderer.invoke('get-song-notes', songId),
  playSong: (songId, options) => ipcRenderer.invoke('play-song', songId, options),
  stopSong: () => ipcRenderer.invoke('stop-song'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  openAccessibility: () => ipcRenderer.invoke('open-accessibility'),
  checkAccessibility: () => ipcRenderer.invoke('check-accessibility'),
  promptAccessibility: () => ipcRenderer.invoke('prompt-accessibility'),
  testKey: (key) => ipcRenderer.invoke('test-key', key),
  onStatus: (cb) => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('player-status', handler);
    return () => ipcRenderer.removeListener('player-status', handler);
  },
  onHotkeyStart: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('hotkey-start', handler);
    return () => ipcRenderer.removeListener('hotkey-start', handler);
  },
  onHotkeyStop: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('hotkey-stop', handler);
    return () => ipcRenderer.removeListener('hotkey-stop', handler);
  },
  onAccessibilityStatus: (cb) => {
    const handler = (_e, trusted) => cb(trusted);
    ipcRenderer.on('accessibility-status', handler);
    return () => ipcRenderer.removeListener('accessibility-status', handler);
  },
});
