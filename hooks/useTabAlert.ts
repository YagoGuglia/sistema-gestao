"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseTabAlertOptions {
  pendingCount: number;
  audioEnabled: boolean;
  audioIntervalSeconds: number; // 0 = play once
  storeName?: string;
}

/**
 * Hook que pisca o título da aba e toca áudio quando
 * a aba está minimizada/em segundo plano e há pedidos pendentes.
 * Para quando o usuário volta à aba.
 */
export function useTabAlert({
  pendingCount,
  audioEnabled,
  audioIntervalSeconds,
  storeName = "Vitrinia",
}: UseTabAlertOptions) {
  const originalTitle = useRef<string>("");
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isHidden = useRef(false);

  // Inicializa o áudio uma vez
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/NewNotification.mp3");
    }
    originalTitle.current = document.title;
    return () => {
      document.title = originalTitle.current || storeName;
    };
  }, [storeName]);

  const playSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Autoplay blocked - user needs to interact first
        });
      }
    } catch {
      // Silently fail
    }
  }, []);

  const startBlinking = useCallback(() => {
    if (blinkIntervalRef.current) return;

    let toggle = false;
    blinkIntervalRef.current = setInterval(() => {
      toggle = !toggle;
      document.title = toggle
        ? `⚡ ${pendingCount} pedido${pendingCount > 1 ? "s" : ""} aguardando!`
        : `${storeName} Admin`;
    }, 1000);
  }, [pendingCount, storeName]);

  const stopBlinking = useCallback(() => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
    document.title = originalTitle.current || `${storeName} Admin`;
  }, [storeName]);

  const startAudioLoop = useCallback(() => {
    if (audioIntervalRef.current || !audioEnabled) return;

    playSound();

    if (audioIntervalSeconds > 0) {
      audioIntervalRef.current = setInterval(playSound, audioIntervalSeconds * 1000);
    }
  }, [audioEnabled, audioIntervalSeconds, playSound]);

  const stopAudioLoop = useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pendingCount <= 0) {
      stopBlinking();
      stopAudioLoop();
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isHidden.current = true;
        startBlinking();
        if (audioEnabled) startAudioLoop();
      } else {
        isHidden.current = false;
        stopBlinking();
        stopAudioLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Se a aba já está escondida quando o hook monta, inicia imediatamente
    if (document.hidden && pendingCount > 0) {
      isHidden.current = true;
      startBlinking();
      if (audioEnabled) startAudioLoop();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopBlinking();
      stopAudioLoop();
    };
  }, [pendingCount, audioEnabled, startBlinking, stopBlinking, startAudioLoop, stopAudioLoop]);
}

