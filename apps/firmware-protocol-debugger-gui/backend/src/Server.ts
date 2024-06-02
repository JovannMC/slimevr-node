import { ServerStatus } from '@slimevr/firmware-protocol-debugger-shared';
import { ConnectionTracker, newEvents, Tracker, utils } from '@slimevr/firmware-protocol-debugger-utils';
import { createSocket } from 'node:dgram';

const [broadcastBlacklist, addressBlacklist] = utils.getBroadcastAddresses();
console.log('Blacklisted broadcast IPs:', broadcastBlacklist.join(', '));
console.log('Blacklisted IPs:', addressBlacklist.join(', '));

export class Server {
  readonly events = newEvents();

  private readonly socket = createSocket('udp4');
  private readonly connectionTracker = new ConnectionTracker(this.events);

  private removeOldConnectionsTimer: NodeJS.Timeout | null = null;
  private pingConnectionsTimer: NodeJS.Timeout | null = null;

  start(): Promise<void> {
    this.socket.on('error', (err) => {
      console.log('Server Error:', err);
    });

    this.socket.on('message', (msg, rinfo) => {
      if (addressBlacklist.includes(rinfo.address) && rinfo.port === 6969) {
        return;
      }

      let tracker = this.connectionTracker.getConnectionByIP(rinfo.address);

      if (!tracker) {
        tracker = new Tracker(this.events, this.socket, this.connectionTracker, rinfo.address, rinfo.port);
        this.connectionTracker.addConnection(tracker);
      }

      tracker.handle(msg);
    });

    this.removeOldConnectionsTimer = setInterval(() => this.connectionTracker.removeOldConnections(), 500).unref();
    this.pingConnectionsTimer = setInterval(() => this.connectionTracker.pingConnections(), 1000).unref();

    return new Promise((resolve) => {
      this.socket
        .once('listening', () => {
          this.events.emit('server:status', ServerStatus.Running);

          resolve();
        })
        .bind(6969, '0.0.0.0');
    });
  }

  async stop(): Promise<void> {
    if (this.removeOldConnectionsTimer) {
      clearInterval(this.removeOldConnectionsTimer);
    }

    if (this.pingConnectionsTimer) {
      clearInterval(this.pingConnectionsTimer);
    }

    this.connectionTracker.removeAllConnections();

    return new Promise((resolve) => {
      this.socket
        .once('close', () => {
          this.events.emit('server:status', ServerStatus.Stopped);

          resolve();
        })
        .close();
    });
  }
}
