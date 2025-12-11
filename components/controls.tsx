"use client";
import { Leva } from "leva";

export const Controls = () => {
   return (
      <Leva
         // fill // default = false, true makes the pane fill the parent dom node it's rendered in
         // flat // default = false, true removes border radius and shadow
         // oneLineLabels // default = false, alternative layout for labels, with labels and fields on separate rows
         collapsed={true} // default = false, when true the GUI is collapsed
         // neverHide // default = false, when true the GUI stays visible even when no controls are mounted
         // hideCopyButton // default = false, hides the copy button in the title bar
         // titleBar={{
         //    // Configure title bar options
         //    title: "My Controls", // Custom title
         //    drag: true, // Enable dragging
         //    filter: true, // Enable filter/search
         //    position: { x: 0, y: 0 }, // Initial position (when drag is enabled)
         //    onDrag: position => {}, // Callback when dragged
         // }}
      />
   );
};
