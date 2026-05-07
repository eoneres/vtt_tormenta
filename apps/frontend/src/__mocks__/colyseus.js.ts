// Mock for colyseus.js in Jest tests
export class Client {
  connect = jest.fn().mockResolvedValue({});
  reconnect = jest.fn();
  send = jest.fn();
}

export class Room {
  onJoin = jest.fn();
  onLeave = jest.fn();
  onMessage = jest.fn();
  onError = jest.fn();
  onStateChange = jest.fn();
  send = jest.fn();
  leave = jest.fn();
  state = {};
}

export default { Client, Room };
