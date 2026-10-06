import { useEffect } from 'react';
import socketService from '../services/socket';

export function useSocket(requestId, handlers = {}) {
  useEffect(() => {
    if (!requestId) return;

    socketService.connect();
    socketService.joinRequestRoom(requestId);

    if (handlers.onLocationUpdate) {
      socketService.onLocationUpdate(handlers.onLocationUpdate);
    }
    if (handlers.onStatusChange) {
      socketService.onStatusChange(handlers.onStatusChange);
    }
    if (handlers.onEtaUpdate) {
      socketService.onEtaUpdate(handlers.onEtaUpdate);
    }

    return () => {
      socketService.leaveRequestRoom(requestId);
      socketService.removeAllListeners();
    };
  }, [requestId]);

  return socketService;
}

export default useSocket;

