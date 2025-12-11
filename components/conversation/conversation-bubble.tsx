import React, { useState, useEffect } from "react";
import { Float, Html } from "@react-three/drei";
import { Message, ProjectData } from "./types";
import { TextMessage } from "./text-message";
import { ProjectCard } from "./project-card";
import { AnimatePresence, motion } from "framer-motion";

interface ConversationBubbleProps {
   position?: [number, number, number];
   visible?: boolean;
}

const MOCK_MESSAGES: Message[] = [
   {
      id: "1",
      type: "text",
      content: {
         text: "Hi there! I'm your virtual assistant. Check out some of my recent work below. You can ask me about my projects, experience, or education.",
      },
      timestamp: Date.now(),
      voiceOutput:
         "Hi there! I'm your virtual assistant. Check out some of my recent work below. You can ask me about my projects, experience, or education.",
      emote: "happy",
   },

   {
      id: "2",
      type: "project",
      content: {
         title: "Neon City Explorer",
         description:
            "A 3D interactive experience exploring a futuristic cyberpunk city built with Three.js and React.",
         link: "https://example.com/neon-city",
         tags: ["React", "Three.js", "WebGL"],
         image: "https://shorthand.com/the-craft/raster-images/assets/5kVrMqC0wp/sh-unsplash_5qt09yibrok-4096x2731.jpeg",
      } as ProjectData,
      timestamp: Date.now() + 1000,
      voiceOutput:
         "Here is a project I worked on called Neon City Explorer. It is a 3D interactive experience exploring a futuristic cyberpunk city built with Three.js and React.",
      emote: "happy",
   },
];

export const ConversationBubble: React.FC<ConversationBubbleProps> = ({
   position = [1.5, 1.5, 0],
   visible = true,
}) => {
   const [isOpen, setIsOpen] = useState(true);
   const [displayIndex, setDisplayIndex] = useState(-1);

   const currentMessage = MOCK_MESSAGES[displayIndex] ?? null;
   console.log("displayIndex", displayIndex);

   useEffect(() => {
      let timer: NodeJS.Timeout;
      if (visible) {
         timer = setInterval(() => {
            setDisplayIndex(prev => {
               if (prev < MOCK_MESSAGES.length - 1) {
                  return prev + 1;
               }
               clearInterval(timer);
               return prev;
            });
         }, 2000);
      }

      return () => {
         clearTimeout(timer);
         setDisplayIndex(-1);
      };
   }, [visible]);

   if (!visible) return null;

   return (
      <Html position={position} transform distanceFactor={4}>
         <div className="w-[400px] flex flex-col items-start gap-4 p-6 pointer-events-none text-2xl">
            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8, y: 20 }}
                     transition={{ duration: 0.3 }}
                     className="flex flex-col gap-3 w-full pointer-events-auto origin-bottom-left"
                  >
                     <AnimatePresence mode="popLayout">
                        {currentMessage && (
                           <motion.div
                              initial={{ opacity: 0, x: -20, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 24 }}
                              layout
                           >
                              {currentMessage.type === "text" && (
                                 <TextMessage
                                    text={(currentMessage.content as { text: string }).text}
                                 />
                              )}

                              {currentMessage.type === "project" && (
                                 <ProjectCard data={currentMessage.content as ProjectData} />
                              )}
                           </motion.div>
                        )}
                     </AnimatePresence>
                     {displayIndex === -1 && (
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
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </Html>
   );
};
