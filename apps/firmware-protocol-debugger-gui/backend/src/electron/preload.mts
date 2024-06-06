import { type SerializedTracker, type ServerStatus } from '@slimevr/firmware-protocol-debugger-shared';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getServerStatus: () => ipcRenderer.invoke('server:status:get'),
  startServer: () => ipcRenderer.send('server:start'),
  stopServer: () => ipcRenderer.send('server:stop'),
  onServerStatusChanged: (callback: (_: unknown, status: ServerStatus) => void) =>
    ipcRenderer.on('server:status', callback),
  removeServerStatusChangedListener: (callback: (_: unknown, status: ServerStatus) => void) =>
    ipcRenderer.removeListener('server:status', callback),

  getTrackers: () => ipcRenderer.invoke('trackers:get'),
  onNewTracker: (callback: (_: unknown, tracker: SerializedTracker) => void) => ipcRenderer.on('tracker:new', callback),
  removeNewTrackerListener: (callback: (_: unknown, tracker: SerializedTracker) => void) =>
    ipcRenderer.removeListener('tracker:new', callback),
  onTrackerChanged: (callback: (_: unknown, tracker: SerializedTracker) => void) =>
    ipcRenderer.on('tracker:changed', callback),
  removeTrackerChangedListener: (callback: (_: unknown, tracker: SerializedTracker) => void) =>
    ipcRenderer.removeListener('tracker:changed', callback),
  onTrackerRemoved: (callback: (_: unknown, tracker: SerializedTracker) => void) =>
    ipcRenderer.on('tracker:removed', callback),
  removeTrackerRemovedListener: (callback: (_: unknown, tracker: SerializedTracker) => void) =>
    ipcRenderer.removeListener('tracker:removed', callback)
});
