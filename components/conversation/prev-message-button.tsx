import React from "react";

interface PrevMessageButtonProps {
   onClick?: () => void;
   disabled?: boolean;
}

export const PrevMessageButton: React.FC<PrevMessageButtonProps> = ({ onClick, disabled }) => {
   return (
      <button
         className={`w-full bg-white/5 backdrop-blur-md rounded-t-3xl rounded-b-none py-2 px-10 border-x border-t border-white/10 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(112,0,255,0.3)] flex items-center justify-center ${
            disabled
               ? "opacity-50 cursor-not-allowed hover:border-white/10"
               : "hover:border-white/20 cursor-pointer hover:bg-white/10 active:scale-[0.99]"
         }`}
         onClick={onClick}
         disabled={disabled}
         aria-label="Previous message"
      >
         <svg
            width="32"
            height="12"
            viewBox="0 0 32 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/50 group-hover:text-white transition-colors"
         >
            <path d="M2 10L16 2L30 10" />
         </svg>
      </button>
   );
};
