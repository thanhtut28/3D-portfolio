"use client";

import { useEffect, useRef, useCallback } from "react";
import { Lipsync } from "wawa-lipsync";

export const lipsyncManager = typeof window !== "undefined" ? new Lipsync() : null;

export function useLipsync() {
   const audioRef = useRef<HTMLAudioElement>(null);
   const animationFrameRef = useRef<number | null>(null);

   useEffect(() => {
      if (!lipsyncManager) return;

      const analyzeAudio = () => {
         animationFrameRef.current = requestAnimationFrame(analyzeAudio);
         lipsyncManager.processAudio();
      };

      analyzeAudio();

      return () => {
         if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
         }
      };
   }, []);

   const playAudio = useCallback((audioBase64: string): Promise<void> => {
      return new Promise((resolve, reject) => {
         if (!audioRef.current || !lipsyncManager) {
            reject(new Error("Audio element or lipsync manager not available"));
            return;
         }

         try {
            const audioData = Uint8Array.from(atob(audioBase64), char => char.charCodeAt(0));
            const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
            const audioUrl = URL.createObjectURL(audioBlob);

            audioRef.current.src = audioUrl;
            lipsyncManager.connectAudio(audioRef.current);

            audioRef.current.onended = () => {
               URL.revokeObjectURL(audioUrl);
               resolve();
            };

            audioRef.current.onerror = () => {
               URL.revokeObjectURL(audioUrl);
               reject(new Error("Failed to play audio"));
            };

            audioRef.current.play().catch(reject);
         } catch (error) {
            reject(error);
         }
      });
   }, []);

   const stopAudio = useCallback(() => {
      if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.currentTime = 0;
      }
   }, []);

   return {
      audioRef,
      playAudio,
      stopAudio,
      lipsyncManager,
   };
}
