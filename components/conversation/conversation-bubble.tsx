import { Html } from "@react-three/drei";
import { AnimatePresence, motion, Transition } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
   messagesAtom,
   thinkingAtom,
   currentMessageAtom,
   hasMultipleMessagesAtom,
   canGoPrevAtom,
   canGoNextAtom,
   goToPrevMessageAtom,
   goToNextMessageAtom,
   messageIndexAtom,
} from "@/atoms";
import { NextMessageButton } from "./next-message-button";
import { PrevMessageButton } from "./prev-message-button";
import { ProjectCard } from "./project-card";
import { ExperienceCard } from "./experience-card";
import { TextMessage } from "./text-message";
import { Project, Experience } from "./types";

interface ConversationBubbleProps {
   position?: [number, number, number];
   visible?: boolean;
}

const springTransition: Transition = {
   type: "spring",
   stiffness: 400,
   damping: 30,
};

const ThinkingIndicator: React.FC = () => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl text-lg text-white/80 border border-white/10 w-fit flex items-center gap-2 mt-2"
   >
      <span className="text-purple-300">●</span>
      <span className="text-purple-300 animate-bounce delay-100">●</span>
      <span className="text-purple-300 animate-bounce delay-200">●</span>
   </motion.div>
);

const MessageContent: React.FC<{
   message: { type: string; content: unknown };
   hasSingleMessage: boolean;
}> = ({ message, hasSingleMessage }) => {
   const content = message.content;

   return (
      <div
         className={`w-full bg-white/10 backdrop-blur-md border-x border-white/10 ${
            hasSingleMessage ? "rounded-3xl" : ""
         }`}
      >
         {message.type === "text" && <TextMessage text={(content as { text: string }).text} />}
         {message.type === "project" && <ProjectCard data={content as Project} />}
         {message.type === "experience" && <ExperienceCard data={content as Experience} />}
      </div>
   );
};

export const ConversationBubble: React.FC<ConversationBubbleProps> = ({
   position = [1.5, 1.5, 0],
   visible = true,
}) => {
   const [isOpen, setIsOpen] = useState(true);

   // Use derived atoms for cleaner state access
   const messages = useAtomValue(messagesAtom);
   const thinking = useAtomValue(thinkingAtom);
   const currentMessage = useAtomValue(currentMessageAtom);
   const hasMultipleMessages = useAtomValue(hasMultipleMessagesAtom);
   const canGoPrev = useAtomValue(canGoPrevAtom);
   const canGoNext = useAtomValue(canGoNextAtom);
   const messageIndex = useAtomValue(messageIndexAtom);

   const goToPrev = useSetAtom(goToPrevMessageAtom);
   const goToNext = useSetAtom(goToNextMessageAtom);

   const setMessageIndex = useSetAtom(messageIndexAtom);

   useEffect(() => {
      if (thinking) {
         setMessageIndex(0);
      }
   }, [thinking, setMessageIndex]);

   useEffect(() => {
      if (visible) {
         setIsOpen(true);
      }
   }, [visible]);

   if (!visible) return null;

   const showPagination = messageIndex !== -1 && hasMultipleMessages;

   return (
      <Html position={position} transform distanceFactor={4}>
         <div className="w-[400px] flex flex-col items-center gap-4 p-6 pointer-events-none text-2xl">
            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8, y: 20 }}
                     transition={{ duration: 0.3 }}
                     className="flex flex-col items-center gap-0 w-full pointer-events-auto origin-bottom-left"
                  >
                     {showPagination && (
                        <motion.div
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           transition={springTransition}
                           className="w-full flex justify-center"
                        >
                           <PrevMessageButton onClick={goToPrev} disabled={!canGoPrev} />
                        </motion.div>
                     )}

                     <AnimatePresence mode="popLayout">
                        {currentMessage && (
                           <motion.div
                              key={currentMessage.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={springTransition}
                              className="w-full"
                           >
                              <MessageContent
                                 message={currentMessage}
                                 hasSingleMessage={messages.length === 1}
                              />
                           </motion.div>
                        )}
                        {thinking && <ThinkingIndicator />}
                     </AnimatePresence>

                     {showPagination && (
                        <motion.div
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           transition={springTransition}
                           className="w-full flex justify-center"
                        >
                           <NextMessageButton onClick={goToNext} disabled={!canGoNext} />
                        </motion.div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </Html>
   );
};
