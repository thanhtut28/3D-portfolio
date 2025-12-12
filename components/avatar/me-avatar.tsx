import * as THREE from "three";
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { easeOutCubic } from "./experience";
import { lipsyncManager } from "../chat/chat-box-container";
import { folder, useControls } from "leva";
import { VISEMES } from "wawa-lipsync";
import { Vector2 } from "three";

export const clamp = (value: number, max: number, min: number): number =>
   Math.min(Math.max(min, value), max);
export const lerp = (start: number, end: number, time = 0.05): number =>
   start * (1 - time) + end * time;

type GLTFResult = GLTF & {
   nodes: {
      EyeLeft: THREE.SkinnedMesh;
      EyeRight: THREE.SkinnedMesh;
      Wolf3D_Head: THREE.SkinnedMesh;
      Wolf3D_Teeth: THREE.SkinnedMesh;
      Wolf3D_Hair: THREE.SkinnedMesh;
      Wolf3D_Glasses: THREE.SkinnedMesh;
      Wolf3D_Outfit_Top: THREE.SkinnedMesh;
      Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
      Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
      Wolf3D_Body: THREE.SkinnedMesh;
      Hips: THREE.Bone;
   };
   materials: {
      Wolf3D_Eye: THREE.MeshStandardMaterial;
      Wolf3D_Skin: THREE.MeshStandardMaterial;
      Wolf3D_Teeth: THREE.MeshStandardMaterial;
      Wolf3D_Hair: THREE.MeshStandardMaterial;
      Wolf3D_Glasses: THREE.MeshStandardMaterial;
      Wolf3D_Outfit_Top: THREE.MeshStandardMaterial;
      Wolf3D_Outfit_Bottom: THREE.MeshStandardMaterial;
      Wolf3D_Outfit_Footwear: THREE.MeshStandardMaterial;
      Wolf3D_Body: THREE.MeshPhysicalMaterial;
   };
};

type MeAvatarProps = JSX.IntrinsicElements["group"] & {
   cameraSettled: boolean;
   talking: boolean;
};

export function MeAvatar({ cameraSettled, talking, ...props }: MeAvatarProps) {
   const group = useRef<THREE.Group>(null);
   const { nodes, materials, scene } = useGLTF("/models/avatar3.glb") as unknown as GLTFResult;

   const { animations: sadAnimation } = useFBX("/animations/sad.fbx");
   const { animations: boredAnimation } = useFBX("/animations/bored.fbx");

   sadAnimation[0].name = "sad";
   boredAnimation[0].name = "bored";

   const { actions } = useAnimations([sadAnimation[0], boredAnimation[0]], group);
   const [currentAction, setCurrentAction] = useState<string>("sad");

   const progressRef = useRef(0);
   const headLookTarget = useRef(new THREE.Vector3());
   const blinkRef = useRef(false);
   const [winkLeft, setWinkLeft] = useState(false);
   const [winkRight, setWinkRight] = useState(false);

   // Refs for head/neck rotation to persist across frames
   const currentPosRef = useRef(new Vector2(0, 0));
   const targetPosRef = useRef(new Vector2(0, 0));
   const nextMovementTimeRef = useRef(0);
   const isMovingRef = useRef(false);
   const movementDurationRef = useRef(0);
   const visemeValues = useMemo(() => Object.values(VISEMES), []);

   let setupMode = false;

   // Cache morph target references to avoid scene traversal every frame
   const morphTargetMeshes = useRef<
      Map<
         string,
         Array<{
            mesh: THREE.SkinnedMesh;
            index: number;
         }>
      >
   >(new Map());

   // Build the morph target cache once
   useEffect(() => {
      const cache = new Map<
         string,
         Array<{
            mesh: THREE.SkinnedMesh;
            index: number;
         }>
      >();

      scene.traverse((child: any) => {
         if (child.isSkinnedMesh && child.morphTargetDictionary) {
            Object.keys(child.morphTargetDictionary).forEach(targetName => {
               const index = child.morphTargetDictionary[targetName];
               if (index !== undefined && child.morphTargetInfluences[index] !== undefined) {
                  if (!cache.has(targetName)) {
                     cache.set(targetName, []);
                  }
                  cache.get(targetName)!.push({ mesh: child, index });
               }
            });
         }
      });

      morphTargetMeshes.current = cache;
   }, [scene]);

   useEffect(() => {
      if (!actions || !actions[currentAction]) return;

      const action = actions[currentAction];
      action.reset().fadeIn(0.5).play();

      return () => {
         action.reset().fadeOut(0.5);
      };
   }, [actions, currentAction]);

   useEffect(() => {
      if (cameraSettled) {
         setCurrentAction("bored");
      } else {
         setCurrentAction("sad");
      }
   }, [cameraSettled]);

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

   useFrame(state => {
      const rad = Math.PI / 180;
      const eyeRotationOffsetX = 0;
      const neckBoneRotationOffsetX = 10 * rad;
      const n = nodes as any;

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

   const lerpMorphTarget = useCallback((target: string, value: number, speed = 0.1) => {
      const meshes = morphTargetMeshes.current.get(target);
      if (!meshes) return;

      for (let i = 0; i < meshes.length; i++) {
         const { mesh, index } = meshes[i];
         mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences![index],
            value,
            speed
         );
      }
   }, []);

   useFrame(state => {
      // Early return if cache not ready
      if (morphTargetMeshes.current.size === 0) return;
      const time = state.clock.getElapsedTime();

      lerpMorphTarget("eyeBlinkLeft", blinkRef.current || winkLeft ? 1 : 0, 0.5);
      lerpMorphTarget("eyeBlinkRight", blinkRef.current || winkRight ? 1 : 0, 0.5);
      // Subtle natural mouth expressions - very gentle movements

      const subtleSmile = Math.sin(time * 0.2) * 0.2 + Math.cos(time * 0.5) * 0.2;
      const asymmetryOffset = Math.sin(time * 0.15) * 0.07; // Slight asymmetry for realism
      lerpMorphTarget("mouthSmileLeft", Math.max(0, subtleSmile + asymmetryOffset), 0.3);
      lerpMorphTarget("mouthSmileRight", Math.max(0, subtleSmile - asymmetryOffset), 0.3);

      // Occasional very subtle frown (much less frequent)
      // const subtleFrown = Math.sin(time * 0.1) * 0.008;
      // const frownAsymmetry = Math.sin(time * 0.12) * 0.002;
      // lerpMorphTarget("mouthFrownLeft", Math.max(0, subtleFrown + frownAsymmetry), 0.2);
      // lerpMorphTarget("mouthFrownRight", Math.max(0, subtleFrown - frownAsymmetry), 0.2);

      // LIPSYNC
      if (setupMode) {
         return;
      }

      const viseme = lipsyncManager!.viseme;
      const lipsyncState = (lipsyncManager as any).state;
      const activeSpeed = lipsyncState === "vowel" ? 0.2 : 0.4;
      const inactiveSpeed = lipsyncState === "vowel" ? 0.1 : 0.2;

      // Process active viseme first
      lerpMorphTarget(viseme, 1, activeSpeed);

      // Process inactive visemes - optimized loop
      for (let i = 0; i < visemeValues.length; i++) {
         if (visemeValues[i] !== viseme) {
            lerpMorphTarget(visemeValues[i], 0, inactiveSpeed);
         }
      }
   });

   useEffect(() => {
      let blinkTimeout: NodeJS.Timeout;
      let blinkOffTimeout: NodeJS.Timeout;
      const nextBlink = () => {
         blinkTimeout = setTimeout(() => {
            blinkRef.current = true;
            blinkOffTimeout = setTimeout(() => {
               blinkRef.current = false;
               nextBlink();
            }, 200);
         }, THREE.MathUtils.randInt(1000, 5000));
      };
      nextBlink();
      return () => {
         clearTimeout(blinkTimeout);
         clearTimeout(blinkOffTimeout);
      };
   }, []);

   return (
      <group {...props} dispose={null} ref={group}>
         <primitive object={nodes.Hips} />
         <skinnedMesh
            name="EyeLeft"
            geometry={nodes.EyeLeft.geometry}
            material={materials.Wolf3D_Eye}
            skeleton={nodes.EyeLeft.skeleton}
            morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            name="EyeRight"
            geometry={nodes.EyeRight.geometry}
            material={materials.Wolf3D_Eye}
            skeleton={nodes.EyeRight.skeleton}
            morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            name="Wolf3D_Head"
            geometry={nodes.Wolf3D_Head.geometry}
            material={materials.Wolf3D_Skin}
            skeleton={nodes.Wolf3D_Head.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            name="Wolf3D_Teeth"
            geometry={nodes.Wolf3D_Teeth.geometry}
            material={materials.Wolf3D_Teeth}
            skeleton={nodes.Wolf3D_Teeth.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Hair.geometry}
            material={materials.Wolf3D_Hair}
            skeleton={nodes.Wolf3D_Hair.skeleton}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Glasses.geometry}
            material={materials.Wolf3D_Glasses}
            skeleton={nodes.Wolf3D_Glasses.skeleton}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Top.geometry}
            material={materials.Wolf3D_Outfit_Top}
            skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
            material={materials.Wolf3D_Outfit_Bottom}
            skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
            material={materials.Wolf3D_Outfit_Footwear}
            skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
            castShadow
            receiveShadow
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Body.geometry}
            material={materials.Wolf3D_Body}
            skeleton={nodes.Wolf3D_Body.skeleton}
            castShadow
            receiveShadow
         />
      </group>
   );
}

useGLTF.preload("/models/avatar3.glb");
