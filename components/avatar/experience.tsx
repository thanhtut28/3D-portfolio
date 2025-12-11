"use client";
import { Backdrop, Environment, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ConversationBubble } from "../conversation/conversation-bubble";
import { MeAvatar } from "./me-avatar";

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const Experience = ({ talking }: { talking: boolean }) => {
   const { camera } = useThree();
   const progressRef = useRef(0);
   const initializedRef = useRef(false);
   const pedestalRef = useRef<THREE.Group>(null);
   const [cameraSettled, setCameraSettled] = useState<boolean>(false);
   const {
      bg,
      fogColor,
      fogNear,
      fogFar,
      camInitPos,
      camTargetPos,
      camLookAt,
      animSpeed,
      ambientIntensity,
      spotIntensity,
      spotPos,
      rimColor1,
      rimPos1,
      rimColor2,
      rimPos2,
      directionalLightPosition,
      directionalLightColor,
      directionalLightIntensity,
   } = useControls({
      Environment: folder({
         bg: "#131313",
         fogColor: "#131313",
         fogNear: { value: 5, min: 0, max: 20 },
         fogFar: { value: 20, min: 10, max: 50 },
      }),
      Camera: folder({
         camInitPos: { value: [0, 8, 10], step: 0.1 },
         camTargetPos: { value: [0, 3, 4.5], step: 0.1 },
         camLookAt: { value: [0, 2.1, 0.5], step: 0.1 },
         animSpeed: { value: 0.3, min: 0.05, max: 2 },
      }),
      Lighting: folder({
         directionalLightColor: "#7000ff",
         directionalLightIntensity: 2.2,
         directionalLightPosition: { value: [5, 5, 5], step: 0.1 },
         ambientIntensity: { value: 0.5, min: 0, max: 2 },
         spotIntensity: { value: 1, min: 0, max: 5 },
         spotPos: { value: [5, 5, 5] },
         rimColor1: "#7000ff",
         rimPos1: [-2, 2, -2],
         rimColor2: "#00ffff",
         rimPos2: [2, 3, 2],
      }),
   });

   // Convert arrays to Vectors for animation logic
   const initialPosVec = new THREE.Vector3(...(camInitPos as [number, number, number]));
   const targetPosVec = new THREE.Vector3(...(camTargetPos as [number, number, number]));
   const lookAtVec = new THREE.Vector3(...(camLookAt as [number, number, number]));

   useEffect(() => {
      if (!("isPerspectiveCamera" in camera)) return;
      const cam = camera as THREE.PerspectiveCamera;

      cam.position.copy(initialPosVec);
      cam.fov = 30;
      cam.lookAt(lookAtVec);
      cam.updateProjectionMatrix();
      initializedRef.current = true;
   }, [camera]); // Initial setup only

   useFrame((_, delta) => {
      if (!initializedRef.current) return;
      if (!("isPerspectiveCamera" in camera)) return;
      const cam = camera as THREE.PerspectiveCamera;

      progressRef.current = Math.min(progressRef.current + delta * animSpeed, 1);
      const t = easeOutCubic(progressRef.current);

      cam.position.lerpVectors(initialPosVec, targetPosVec, t);
      cam.lookAt(lookAtVec);
      cam.updateProjectionMatrix();

      if (camera.position.distanceTo(targetPosVec) < 0.1) {
         setCameraSettled(true);
      }
   });

   useFrame(({ clock }) => {
      if (cameraSettled) {
         const cam = camera as THREE.PerspectiveCamera;

         // Gentle breathing motion relative to the target settled position
         const time = clock.getElapsedTime();

         // Smooth side-to-side sway
         const swayX = Math.sin(time * 0.5) * 0.08; // Slow sway
         // Subtle up-down breathing
         const breatheY = Math.cos(time * 0.3) * 0.09;

         // Apply offsets to the target position
         cam.position.x = targetPosVec.x + swayX;
         cam.position.y = targetPosVec.y + breatheY;

         // Keep looking at the target point
         cam.lookAt(lookAtVec);
         cam.updateProjectionMatrix();
      }
   });

   return (
      <>
         <color attach="background" args={[bg]} />
         <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

         <group position={[0, 0.5, 0.2]}>
            <MeAvatar cameraSettled={cameraSettled} talking={talking} position={[-0.8, 0, -1]} />
            <ConversationBubble visible={cameraSettled} position={[1, 1.3, -5.5]} />
         </group>

         {/* Lighting & Environment */}
         <directionalLight
            position={directionalLightPosition as any}
            intensity={directionalLightIntensity}
            // color={directionalLightColor}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
         />
         <directionalLight
            position={[-5, 5, 5] as any}
            intensity={0.7}
            color={directionalLightColor}
            castShadow
         />
         <directionalLight position={[1.5, 0.5, -10] as any} intensity={7} color={"red"} />
         <directionalLight position={[-1.5, 0.5, -10] as any} intensity={25} color={"blue"} />
         <ambientLight intensity={ambientIntensity} />
         <Backdrop scale={[50, 5, 70]} floor={0} receiveShadow position-z={-15} position-y={0.43}>
            <meshStandardMaterial color="#131313" />
         </Backdrop>
         <spotLight
            position={spotPos as any}
            angle={0.15}
            penumbra={1}
            intensity={spotIntensity}
            castShadow
         />
         {/* Rim/Accent lights for "spatial" feel */}
         <pointLight position={rimPos1 as any} intensity={2} color={rimColor1} distance={5} />
         <pointLight position={rimPos2 as any} intensity={1.5} color={rimColor2} distance={5} />

         <Environment preset="city" />

         <Sparkles count={60} scale={8} size={3} speed={0.2} opacity={0.4} color="#ffffff" />
      </>
   );
};
