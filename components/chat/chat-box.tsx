import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ChatBoxProps {
   isLoading: boolean;
   message: string;
   setMessage: (message: string) => void;
   handleSubmit: () => void;
}

export function ChatBox({ isLoading, handleSubmit, message, setMessage }: ChatBoxProps) {
   const [isFocused, setIsFocused] = useState(false);

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
         e.preventDefault();
         handleSubmit();
      }
   };

   const canSubmit = isFocused && message.trim() !== "";

   return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 flex justify-center">
         <motion.div
            layout
            className={cn(
               "relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg p-2 shadow-purple-900/10",
               isFocused
                  ? "ring-2 ring-purple-500/50 border-purple-500/30 scale-[1.02]"
                  : "hover:border-white/20"
            )}
            transition={{
               layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
            }}
         >
            {/* Input Wrapper - Collapses smoothly when loading */}
            <AnimatePresence initial={false}>
               {!isLoading && (
                  <motion.div
                     key="input-wrapper"
                     initial={{ width: 0, opacity: 0 }}
                     animate={{ width: "auto", opacity: 1 }}
                     exit={{ width: 0, opacity: 0 }}
                     transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                     className="flex items-center overflow-hidden whitespace-nowrap"
                  >
                     <div className="pl-3 flex items-center justify-center">
                        <motion.div
                           className={`w-2 h-2 rounded-full ${
                              isFocused ? "bg-purple-400 animate-pulse" : "bg-white/30"
                           }`}
                           animate={{
                              scale: isFocused ? [1, 1.2, 1] : 1,
                           }}
                           transition={{
                              duration: 1,
                              repeat: isFocused ? Infinity : 0,
                              ease: "easeInOut",
                           }}
                        />
                     </div>

                     <input
                        type="text"
                        placeholder="Ask me anything..."
                        className="w-[400px] bg-transparent text-white placeholder-white/40 px-3 py-2 text-base focus:outline-none focus:ring-0 font-light tracking-wide"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                     />
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
               layout
               onClick={handleSubmit}
               className={cn(
                  "rounded-full flex items-center justify-center shrink-0 w-10 h-10",
                  canSubmit || isLoading
                     ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                     : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
               )}
               animate={{
                  rotate: canSubmit || isLoading ? 0 : -90,
               }}
               transition={{
                  rotate: { duration: 0.3, ease: "easeOut" },
               }}
            >
               <AnimatePresence mode="wait" initial={false}>
                  {isLoading ? (
                     <motion.svg
                        key="stop-icon"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                     >
                        <rect x="5" y="5" width="14" height="14" rx="3" />
                     </motion.svg>
                  ) : (
                     <motion.svg
                        key="send-icon"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-0.5"
                     >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                     </motion.svg>
                  )}
               </AnimatePresence>
            </motion.button>

            {/* Background Gradient Effect */}
            <div className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
         </motion.div>
      </div>
   );
}
