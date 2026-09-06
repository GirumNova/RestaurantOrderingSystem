import {
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

const HUB_URL = "http://localhost:5251/hubs/orders";

export function createSignalRConnection() {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => {
        const storedAuth =
          localStorage.getItem("restaurant_auth");

        if (!storedAuth) {
          return "";
        }

        try {
          const auth = JSON.parse(storedAuth);

          return auth.accessToken || "";
        } catch {
          return "";
        }
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}