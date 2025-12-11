import React from "react";

interface TextMessageProps {
   text: string;
   isUser?: boolean;
}

export const TextMessage: React.FC<TextMessageProps> = ({ text, isUser }) => {
   return (
      <div
         className={`
        px-6 py-4 rounded-3xl w-full backdrop-blur-md border transition-all duration-300
        ${
           isUser
              ? "bg-purple-600/20 border-purple-500/30 text-white rounded-br-none ml-auto"
              : "bg-white/10 border-white/10 text-gray-100 rounded-bl-none"
        }
      `}
      >
         <p className="text-lg leading-relaxed">{text}</p>
      </div>
   );
};
