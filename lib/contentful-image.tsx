"use client";

import Image from "next/image";

interface ContentfulImageProps {
   src?: string;
   width?: number;
   quality?: number;
   [key: string]: any; // For other props that might be passed
}

const contentfulLoader = ({ src, width, quality }: ContentfulImageProps) => {
   return `${src}?w=${width}&q=${quality || 75}`;
};

export default function ContentfulImage(props: ContentfulImageProps) {
   if (!props.src) {
      throw new Error("Image source is missing");
   }

   return <Image alt={props.alt} loader={contentfulLoader} src={props.src} {...props} />;
}
