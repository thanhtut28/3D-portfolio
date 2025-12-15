"use client";

import { useState, useCallback } from "react";
import { useSetAtom } from "jotai";
import { chat } from "@/actions/chat";
import {
   talkingAtom,
   thinkingAtom,
   isSubmittingAtom,
   setChatResponseAtom,
   setErrorStateAtom,
   resetConversationAtom,
} from "@/atoms";

interface UseChatSubmitOptions {
   onAudioReady?: (audioBase64: string) => Promise<void>;
   onComplete?: () => void;
   onError?: (error: unknown) => void;
}

export function useChatSubmit(options: UseChatSubmitOptions = {}) {
   const { onAudioReady, onComplete, onError } = options;

   const [message, setMessage] = useState("");
   const [abortController, setAbortController] = useState<AbortController | null>(null);

   const setTalking = useSetAtom(talkingAtom);
   const setThinking = useSetAtom(thinkingAtom);
   const setIsSubmitting = useSetAtom(isSubmittingAtom);
   const setChatResponse = useSetAtom(setChatResponseAtom);
   const setErrorState = useSetAtom(setErrorStateAtom);
   const resetConversation = useSetAtom(resetConversationAtom);

   const isSubmitting = abortController !== null;

   const cancel = useCallback(() => {
      abortController?.abort();
      setAbortController(null);
      setIsSubmitting(false);
      setThinking(false);
   }, [abortController, setIsSubmitting, setThinking]);

   const submit = useCallback(async () => {
      // If already submitting, cancel
      if (isSubmitting) {
         cancel();
         return;
      }

      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;

      // Reset state for new submission
      resetConversation();
      setTalking(true);
      setThinking(true);
      setIsSubmitting(true);

      const controller = new AbortController();
      setAbortController(controller);

      try {
         const { chatResponse, audioBase64 } = await chat(trimmedMessage);

         // Check if aborted
         if (controller.signal.aborted) return;

         setChatResponse(chatResponse.messages);

         if (onAudioReady) {
            await onAudioReady(audioBase64);
         }

         onComplete?.();
      } catch (error) {
         if (controller.signal.aborted) return;

         console.error("Chat error:", error);
         setErrorState();
         onError?.(error);
      } finally {
         setTalking(false);
         setAbortController(null);
         setIsSubmitting(false);
      }
   }, [
      message,
      isSubmitting,
      cancel,
      resetConversation,
      setTalking,
      setThinking,
      setIsSubmitting,
      setChatResponse,
      setErrorState,
      onAudioReady,
      onComplete,
      onError,
   ]);

   return {
      message,
      setMessage,
      submit,
      cancel,
      isSubmitting,
   };
}
