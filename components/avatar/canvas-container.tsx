"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Experience } from "./experience";
import { Camera, Canvas } from "@react-three/fiber";
import { ChatBoxContainer } from "../chat/chat-box-container";

export const CanvasContainer = () => {
   const [talking, setTalking] = useState(false);
   return (
      <>
         <Canvas shadows camera={{ position: [0, 5.5, 5], fov: 45 }}>
            <color attach="background" args={["#131313"]} />

            <Suspense>
               <Experience talking={talking} />
            </Suspense>
         </Canvas>
         <ChatBoxContainer setTalking={setTalking} />
      </>
   );
};
