"use client";

import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { talkingAtom } from "@/atoms";
import { useChatSubmit, useLipsync } from "@/hooks";
import { ChatBox } from "./chat-box";

export function ChatBoxContainer() {
   const setTalking = useSetAtom(talkingAtom);
   const { audioRef, playAudio } = useLipsync();

   const handleAudioReady = useCallback(
      async (audioBase64: string) => {
         try {
            await playAudio(audioBase64);
         } finally {
            setTalking(false);
         }
      },
      [playAudio, setTalking]
   );

   const { message, setMessage, submit, isSubmitting } = useChatSubmit({
      onAudioReady: handleAudioReady,
   });

   return (
      <>
         <ChatBox
            message={message}
            setMessage={setMessage}
            handleSubmit={submit}
            isLoading={isSubmitting}
         />
         <audio ref={audioRef} hidden />
      </>
   );
}
