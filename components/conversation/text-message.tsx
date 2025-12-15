import React from "react";

interface TextMessageProps {
   text: string;
}

export const TextMessage: React.FC<TextMessageProps> = ({ text }) => {
   return (
      <div
         className={`
        px-6 py-4 bg-border text-gray-100 w-full transition-all duration-300 
      `}
      >
         <p className="text-base leading-relaxed">{text}</p>
      </div>
   );
};
