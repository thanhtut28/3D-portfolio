import React from "react";
import { Project } from "./types";

interface ProjectCardProps {
   data: Project;
   onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ data, onClick }) => {
   return (
      <div
         className="bg-transparent overflow-hidden transition-all duration-300 cursor-pointer group w-full"
         onClick={() => {
            if (onClick) onClick();
            window.open(data.link, "_blank");
         }}
      >
         {data.image && (
            <div className="relative h-28 w-full overflow-hidden">
               {/* Use standard img tag since we are in R3F HTML, but optimized images preferred if using Next.js Image component, however standard img is safer for this specific context unless we wrap it carefully */}
               <img
                  src={data.image}
                  alt={data.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
            </div>
         )}

         <div className="py-3 px-6">
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">
               {data.title}
            </h3>
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{data.description}</p>

            {data.tags && (
               <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, idx) => (
                     <span
                        key={idx}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/5"
                     >
                        {tag}
                     </span>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};
