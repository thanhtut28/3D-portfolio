import { talkingAtom } from "@/atoms";
import { lerp } from "@/utils/avatar";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import * as THREE from "three";
import { Vector2 } from "three";

interface Props {
   nodes: any;
}

export const useHeadMovement = ({ nodes }: Props) => {
   const headLookTarget = useRef(new THREE.Vector3());

   // Refs for head/neck rotation to persist across frames
   const currentPosRef = useRef(new Vector2(0, 0));
   const targetPosRef = useRef(new Vector2(0, 0));
   const nextMovementTimeRef = useRef(0);
   const isMovingRef = useRef(false);
   const movementDurationRef = useRef(0);
   const talking = useAtomValue(talkingAtom);

   useFrame(state => {
      const rad = Math.PI / 180;
      const eyeRotationOffsetX = 0;
      const neckBoneRotationOffsetX = 10 * rad;
      const n = nodes;

      if (!n.Neck || !n.Head || !n.EyeLeft || !n.EyeRight) {
         return;
      }

      const time = state.clock.getElapsedTime();
      const currentPos = currentPosRef.current;
      const targetPos = targetPosRef.current;

      // When talking, keep head focused on camera and skip idle motions
      if (talking) {
         headLookTarget.current.lerp(state.camera.position, 0.02);
         n.Head.lookAt(headLookTarget.current);
         const swayZ = Math.cos(time * 0.3) * 0.05 + Math.sin(time * 3) * 0.05;

         n.Head.rotation.z = swayZ;
         return;
      }

      // Human-like behavior: mostly idle with occasional snap movements
      if (time >= nextMovementTimeRef.current) {
         // Time to make a new movement
         isMovingRef.current = true;

         // Random target position for head to look at
         // Smaller range for more subtle movements

         targetPos.x = (Math.random() - 0.5) * 0.15; // -0.075 to 0.075 radians
         targetPos.y = (Math.random() - 0.5) * 0.25; // -0.125 to 0.125 radians

         // Random duration for this movement (quick snap)
         movementDurationRef.current = 0.3 + Math.random() * 0.4; // 0.3-0.7 seconds

         // Schedule next movement (2-6 seconds of idle time)
         nextMovementTimeRef.current = time + movementDurationRef.current + 2 + Math.random() * 4;
      }

      // Apply movement with different speeds
      let lerpSpeed = 0.005; // Slow idle drift

      if (isMovingRef.current) {
         // Fast snap movement
         lerpSpeed = 0.01;

         // Check if we've reached the target (within threshold)
         const distanceToTarget =
            Math.abs(currentPos.x - targetPos.x) + Math.abs(currentPos.y - targetPos.y);
         if (distanceToTarget < 0.01) {
            isMovingRef.current = false;
         }
      }

      // Smooth lerp with context-aware speed
      currentPos.x = lerp(currentPos.x, targetPos.x, lerpSpeed);
      currentPos.y = lerp(currentPos.y, targetPos.y, lerpSpeed);

      // Add tiny breathing motion when idle
      const microBreath = Math.sin(time * 0.5) * 0.008;

      /* eslint-disable no-param-reassign */
      // Apply rotations to neck
      n.Neck.rotation.x = currentPos.x + neckBoneRotationOffsetX + microBreath;
      n.Neck.rotation.y = currentPos.y;

      // Apply rotations to head (slightly more movement than neck)
      n.Head.rotation.x = currentPos.x * 1.2 + microBreath;
      n.Head.rotation.y = currentPos.y * 1.5;

      // Eyes follow with more range
      n.EyeRight.rotation.x = currentPos.x * 1.5 - eyeRotationOffsetX;
      n.EyeLeft.rotation.x = currentPos.x * 1.5 - eyeRotationOffsetX;

      n.EyeRight.rotation.y = currentPos.y * 2;
      n.EyeLeft.rotation.y = currentPos.y * 2;
   });
};

// useFrame((state, delta) => {
//    const lookAtCameraVec = new THREE.Vector3(0, 0, 0);

//    if (cameraSettled) {
//       progressRef.current = Math.min(progressRef.current + delta * 0.3, 1);
//       const cam = state.camera as THREE.PerspectiveCamera;
//       const t = easeOutCubic(progressRef.current);

//       lookAtCameraVec.lerpVectors(lookAtCameraVec, state.camera.position, t);
//       cam.lookAt(lookAtCameraVec);
//       cam.updateProjectionMatrix();

//       const head = group.current?.getObjectByName("Head");

//       if (head && !talking) {
//          const time = state.clock.getElapsedTime();

//          // 2. Generate "Organic" Sway
//          // We combine two sine waves (slow + fast) to simulate randomness
//          // Adjust '0.3'/'0.5' for range (how far it moves)
//          // Adjust '1.2'/'2.5' for speed (how fast it sways)
//          const swayX = Math.sin(time * 0.5) * 0.8 + Math.cos(time * 3) * 0.1;
//          const swayY = Math.cos(time * 0.3) * 0.4 + Math.sin(time * 3) * 0.1;

//          // 3. Calculate the Goal
//          // Take camera position and add the sway
//          const goalPos = state.camera.position.clone();
//          goalPos.x += swayX;
//          goalPos.y += swayY;

//          // 4. Smoothly interpolate (Lerp) the head target
//          // The 0.1 factor controls the "weight" of the head.
//          // Lower (0.05) = Heavy/Slow head. Higher (0.2) = Snappy/Fast head.
//          headLookTarget.current.lerp(goalPos, 0.02);

//          // 5. Apply the lookAt
//          head.lookAt(headLookTarget.current);
//       } else if (head && talking) {
//          headLookTarget.current.lerp(state.camera.position, 0.02);
//          head.lookAt(headLookTarget.current);
//       }
//    }
// });
