const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("neroDesktop", {
  isApp: true,
  speak: (text, rate) => ipcRenderer.invoke("nero:speak", { text, rate }),
  openPet: () => ipcRenderer.invoke("nero:pet", true),
  closePet: () => ipcRenderer.invoke("nero:pet", false),
});
