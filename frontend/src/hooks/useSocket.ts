import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      optionsRef.current.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      optionsRef.current.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      optionsRef.current.onError?.(error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const subscribe = useCallback(<T = any>(event: string, callback: (data: T) => void) => {
    if (!socketRef.current) return () => {};
    
    socketRef.current.on(event, callback);
    
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const emit = useCallback(<T = any>(event: string, data: T, callback?: (response: any) => void) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected');
      return;
    }
    
    socketRef.current.emit(event, data, callback);
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    subscribe,
    emit,
  };
};

export default useSocket;
