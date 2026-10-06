import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRequestRoom(requestId) {
    if (!this.socket) this.connect();
    this.socket.emit('join_request_room', { requestId });
  }

  leaveRequestRoom(requestId) {
    if (this.socket) {
      this.socket.emit('leave_request_room', { requestId });
    }
  }

  onLocationUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('technician_location_update', callback);
  }

  onStatusChange(callback) {
    if (!this.socket) this.connect();
    this.socket.on('status_changed', callback);
  }

  onEtaUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('eta_update', callback);
  }

  startSimulation(requestId) {
    if (!this.socket) this.connect();
    this.socket.emit('start_simulation', { requestId });
  }

  sendTechnicianLocation(data) {
    if (!this.socket) this.connect();
    this.socket.emit('technician_location_update', data);
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.off('technician_location_update');
      this.socket.off('status_changed');
      this.socket.off('eta_update');
      this.socket.off('room_joined');
    }
  }
}

export const socketService = new SocketService();
export default socketService;

