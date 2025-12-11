"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBox } from "./chat-box";
import { chat } from "@/actions/chat";
import { readStreamableValue } from "@ai-sdk/rsc";
import { projectDataSchema } from "../conversation/types";
import { Lipsync } from "wawa-lipsync";

interface ChatBoxContainerProps {
   setTalking: (talking: boolean) => void;
}

export const lipsyncManager = typeof window !== "undefined" ? new Lipsync() : null;

export function ChatBoxContainer({ setTalking }: ChatBoxContainerProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [response, setResponse] = useState("");
   const [abtController, setAbtController] = useState<AbortController | null>(null);
   const audioRef = useRef<HTMLAudioElement>(null);

   useEffect(() => {
      if (!lipsyncManager) return;
      const analyzeAudio = () => {
         requestAnimationFrame(analyzeAudio);
         lipsyncManager.processAudio();
      };

      analyzeAudio();
   }, []);

   const handleSubmit = async () => {
      if (isLoading) {
         abtController?.abort();
         setIsLoading(false);
         setAbtController(null);
         return;
      }

      if (!message.trim()) return;
      setTalking(true);
      setIsLoading(true);
      setResponse("");

      const controller = new AbortController();
      setAbtController(controller);

      try {
         console.log("chatting...");
         const { chatResponse, audioBase64 } = await chat(message);

         const audioData = Uint8Array.from(atob(audioBase64), char => char.charCodeAt(0));
         const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
         const audioUrl = URL.createObjectURL(audioBlob);

         if (!audioRef.current) return;

         audioRef.current.src = audioUrl;
         lipsyncManager!.connectAudio(audioRef.current);
         audioRef.current.play();
         audioRef.current.onended = () => URL.revokeObjectURL(audioUrl);

         setResponse(JSON.stringify(chatResponse));
         console.log("chatResponse", chatResponse);
      } catch (error) {
         console.error(error);
      } finally {
         setIsLoading(false);
         setAbtController(null);
         setTalking(false);
      }
   };

   console.log("response", response);

   return (
      <>
         <ChatBox
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
         />
         <audio ref={audioRef} hidden />
      </>
   );
}
