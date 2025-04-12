const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  sendMessage: (channel, data) => { // Alias for compatibility with frontend
    ipcRenderer.send(channel, data);
  },
  receive: (channel, callback) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  receiveOnce: (channel, callback) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args));
  }
});
