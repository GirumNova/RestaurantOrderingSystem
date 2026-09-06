import { useEffect, useRef } from "react";
import { createSignalRConnection } from "../services/signalRService";

export default function useSignalR(eventHandlers = {}) {
  const connectionRef = useRef(null);

  useEffect(() => {
    const connection = createSignalRConnection();

    connectionRef.current = connection;

    Object.entries(eventHandlers).forEach(
      ([eventName, handler]) => {
        connection.on(eventName, handler);
      }
    );

    async function startConnection() {
      try {
        await connection.start();
        console.log("SignalR connected.");
      } catch (error) {
        console.error(
          "SignalR connection failed:",
          error
        );
      }
    }

    startConnection();

    return () => {
      Object.entries(eventHandlers).forEach(
        ([eventName, handler]) => {
          connection.off(eventName, handler);
        }
      );

      connection.stop();
      connectionRef.current = null;
    };
  }, []);

  return connectionRef;
}