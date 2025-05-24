/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';

export default function useNotifications(onNotification: (data: any) => void) {
  const stompClient = useRef<CompatClient | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws'); // Your backend WebSocket endpoint
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      console.log('Connected to WebSocket');

      // Subscribe to user-specific notification queue
      stompClient.current?.subscribe('/user/queue/notifications', (message: { body: string; }) => {
        const notification = JSON.parse(message.body);
        onNotification(notification);
      });
    }, (error: any) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      stompClient.current?.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    };
  }, [onNotification]);
}