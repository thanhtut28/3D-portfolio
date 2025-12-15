import {
   useAvatarAnimations,
   useHeadMovement,
   useMorphTargetCache,
   useMouthAndEyeMovements,
   lipsyncManager,
} from "@/hooks";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { JSX, useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

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

export function Avatar({ cameraSettled, talking, ...props }: MeAvatarProps) {
   const group = useRef<THREE.Group>(null);
   const { nodes, materials, scene } = useGLTF("/models/avatar3.glb") as unknown as GLTFResult;

   const { animations: sadAnimation } = useFBX("/animations/sad.fbx");
   const { animations: boredAnimation } = useFBX("/animations/bored.fbx");

   sadAnimation[0].name = "sad";
   boredAnimation[0].name = "bored";

   const { actions } = useAnimations([sadAnimation[0], boredAnimation[0]], group);
   const setupMode = false;

   const morphTargetCache = useMorphTargetCache(scene);

   useAvatarAnimations({ actions });
   useHeadMovement({ nodes });
   useMouthAndEyeMovements({
      morphTargetCache,
      setupMode,
      lipsyncManager,
   });

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
