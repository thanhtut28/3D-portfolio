"use client";
import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ChatBoxContainer } from "../chat/chat-box-container";
import { Experience } from "./experience";

export const CanvasContainer = () => {
   return (
      <>
         <Canvas shadows camera={{ position: [0, 5.5, 5], fov: 45 }}>
            <color attach="background" args={["#131313"]} />

            <Suspense>
               <Experience />
            </Suspense>
            <Stats />
         </Canvas>
         <ChatBoxContainer />
      </>
   );
};
