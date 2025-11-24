const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openAndConvert: () => ipcRenderer.invoke('convert:openAndConvert'),
  exportLoop: (src, seconds) => ipcRenderer.invoke('export:loop', src, seconds)
});
