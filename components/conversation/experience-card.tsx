import React from "react";
import { Experience } from "./types";

interface ExperienceCardProps {
   data: Experience;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ data }) => {
   return (
      <div className="bg-transparent overflow-hidden w-full group">
         <div className="relative p-6 bg-linear-to-br from-white/10 to-transparent border-b border-white/5">
            <div className="flex flex-col gap-4 mb-2">
               <div>
                  <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-purple-300 transition-colors duration-300">
                     {data.company}
                  </h3>
                  <p className="text-purple-200 font-medium text-sm">{data.role}</p>
               </div>
               <span className="text-xs w-fit font-medium px-2 py-1 rounded-full bg-white/10 text-white/60 whitespace-nowrap border border-white/5">
                  {data.period}
               </span>
            </div>
         </div>

         {data.jobDescription && (
            <div className="p-6 pt-4">
               <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {data.jobDescription}
               </p>
            </div>
         )}
      </div>
   );
};
