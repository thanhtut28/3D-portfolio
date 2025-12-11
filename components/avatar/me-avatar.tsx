import * as THREE from "three";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { easeOutCubic } from "./experience";
import { lipsyncManager } from "../chat/chat-box-container";
import { useControls } from "leva";
import { VISEMES } from "wawa-lipsync";

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
   const [blink, setBlink] = useState(false);
   const [winkLeft, setWinkLeft] = useState(false);
   const [winkRight, setWinkRight] = useState(false);
   const { smoothMovements } = useControls("Avatar", {
      smoothMovements: {
         value: true,
         label: "Smooth Movements",
      },
   });
   let setupMode = false;

   useEffect(() => {
      actions?.[currentAction]?.reset().fadeIn(0.5).play();
      return () => {
         actions?.[currentAction]?.reset().fadeOut(0.5);
      };
   }, [currentAction]);

   useEffect(() => {
      if (cameraSettled) {
         setCurrentAction("bored");
      } else {
         setCurrentAction("sad");
      }
   }, [cameraSettled]);

   useFrame((state, delta) => {
      const lookAtCameraVec = new THREE.Vector3(0, 0, 0);

      if (cameraSettled) {
         progressRef.current = Math.min(progressRef.current + delta * 0.3, 1);
         const cam = state.camera as THREE.PerspectiveCamera;
         const t = easeOutCubic(progressRef.current);

         lookAtCameraVec.lerpVectors(lookAtCameraVec, state.camera.position, t);
         cam.lookAt(lookAtCameraVec);
         cam.updateProjectionMatrix();

         const head = group.current?.getObjectByName("Head");

         if (head && !talking) {
            const time = state.clock.getElapsedTime();

            // 2. Generate "Organic" Sway
            // We combine two sine waves (slow + fast) to simulate randomness
            // Adjust '0.3'/'0.5' for range (how far it moves)
            // Adjust '1.2'/'2.5' for speed (how fast it sways)
            const swayX = Math.sin(time * 0.5) * 0.8 + Math.cos(time * 3) * 0.1;
            const swayY = Math.cos(time * 0.3) * 0.4 + Math.sin(time * 3) * 0.1;

            // 3. Calculate the Goal
            // Take camera position and add the sway
            const goalPos = state.camera.position.clone();
            goalPos.x += swayX;
            goalPos.y += swayY;

            // 4. Smoothly interpolate (Lerp) the head target
            // The 0.1 factor controls the "weight" of the head.
            // Lower (0.05) = Heavy/Slow head. Higher (0.2) = Snappy/Fast head.
            headLookTarget.current.lerp(goalPos, 0.02);

            // 5. Apply the lookAt
            head.lookAt(headLookTarget.current);
         } else if (head && talking) {
            headLookTarget.current.lerp(state.camera.position, 0.02);
            head.lookAt(headLookTarget.current);
         }
      }
   });

   const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
      scene.traverse((child: any) => {
         if (child.isSkinnedMesh && child.morphTargetDictionary) {
            const index = child.morphTargetDictionary[target];
            if (index === undefined || child.morphTargetInfluences[index] === undefined) {
               return;
            }
            child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
               child.morphTargetInfluences[index],
               value,
               speed
            );
         }
      });
   };

   useFrame(() => {
      lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
      lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

      // LIPSYNC
      if (setupMode) {
         return;
      }

      const viseme = lipsyncManager!.viseme;
      const state = (lipsyncManager as any).state;
      lerpMorphTarget(viseme, 1, smoothMovements ? (state === "vowel" ? 0.2 : 0.4) : 1);

      Object.values(VISEMES).forEach(value => {
         if (viseme === value) {
            return;
         }
         lerpMorphTarget(value, 0, smoothMovements ? (state === "vowel" ? 0.1 : 0.2) : 1);
      });
   });

   useEffect(() => {
      let blinkTimeout: NodeJS.Timeout;
      const nextBlink = () => {
         blinkTimeout = setTimeout(() => {
            setBlink(true);
            setTimeout(() => {
               setBlink(false);
               nextBlink();
            }, 200);
         }, THREE.MathUtils.randInt(1000, 5000));
      };
      nextBlink();
      return () => clearTimeout(blinkTimeout);
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
         />
         <skinnedMesh
            name="EyeRight"
            geometry={nodes.EyeRight.geometry}
            material={materials.Wolf3D_Eye}
            skeleton={nodes.EyeRight.skeleton}
            morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
         />
         <skinnedMesh
            name="Wolf3D_Head"
            geometry={nodes.Wolf3D_Head.geometry}
            material={materials.Wolf3D_Skin}
            skeleton={nodes.Wolf3D_Head.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
         />
         <skinnedMesh
            name="Wolf3D_Teeth"
            geometry={nodes.Wolf3D_Teeth.geometry}
            material={materials.Wolf3D_Teeth}
            skeleton={nodes.Wolf3D_Teeth.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Hair.geometry}
            material={materials.Wolf3D_Hair}
            skeleton={nodes.Wolf3D_Hair.skeleton}
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Glasses.geometry}
            material={materials.Wolf3D_Glasses}
            skeleton={nodes.Wolf3D_Glasses.skeleton}
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Top.geometry}
            material={materials.Wolf3D_Outfit_Top}
            skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
            material={materials.Wolf3D_Outfit_Bottom}
            skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
            material={materials.Wolf3D_Outfit_Footwear}
            skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
         />
         <skinnedMesh
            geometry={nodes.Wolf3D_Body.geometry}
            material={materials.Wolf3D_Body}
            skeleton={nodes.Wolf3D_Body.skeleton}
         />
      </group>
   );
}

useGLTF.preload("/models/me-avatar.glb");
