import { useEffect, useRef } from "react";
import { createSignalRConnection } from "../services/signalRService";

export default function useSignalR(
  eventHandlers = {},
  orderNumber = null
) {
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

        if (orderNumber) {
          await connection.invoke(
            "JoinOrderGroup",
            orderNumber
          );
        }

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

      if (orderNumber) {
        connection
          .invoke(
            "LeaveOrderGroup",
            orderNumber
          )
          .catch(() => {});
      }

      connection.stop();
      connectionRef.current = null;
    };
  }, [orderNumber]);

  return connectionRef;
}