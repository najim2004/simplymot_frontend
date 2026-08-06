"use client";

import { useEffect, useRef } from "react";
import { disconnectSocket, initSocket } from "@/lib/socket";
import { useAuth } from "@/features/auth";

/** Match backend default PRESENCE_HEARTBEAT_MS (60s) — fewer requests, same accuracy */
const HEARTBEAT_INTERVAL_MS = 60000;

/**
 * Tracks dashboard presence only. When the dashboard layout unmounts
 * (user navigates to public/auth pages), the socket disconnects so the
 * session is not left in a stale half-active state.
 */
export const usePresenceTracking = () => {
  const { user } = useAuth();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const socket = initSocket(token, user.id);
    if (!socket) return;

    const emitHeartbeat = () => {
      if (socket.connected && !document.hidden) {
        socket.emit("presence:heartbeat");
      }
    };

    const stopHeartbeat = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    const startHeartbeat = () => {
      emitHeartbeat();
      stopHeartbeat();
      heartbeatRef.current = setInterval(emitHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat();
        return;
      }
      emitHeartbeat();
      startHeartbeat();
    };

    if (socket.connected) {
      startHeartbeat();
    } else {
      socket.once("connect", startHeartbeat);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopHeartbeat();
      socket.off("connect", startHeartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      disconnectSocket();
    };
  }, [user?.id]);
};
