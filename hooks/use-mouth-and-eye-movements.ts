import { useFrame } from "@react-three/fiber";
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Lipsync, VISEMES } from "wawa-lipsync";
import { MorphTargetCache } from "./use-morph-target-cache";

interface Props {
   morphTargetCache: MutableRefObject<MorphTargetCache>;
   setupMode: boolean;
   lipsyncManager: Lipsync | null;
}

export const useMouthAndEyeMovements = ({ morphTargetCache, setupMode, lipsyncManager }: Props) => {
   const blinkRef = useRef(false);
   const [winkLeft, setWinkLeft] = useState(false);
   const [winkRight, setWinkRight] = useState(false);
   const visemeValues = useMemo(() => Object.values(VISEMES), []);

   const lerpMorphTarget = useCallback(
      (target: string, value: number, speed = 0.1) => {
         const meshes = morphTargetCache.current.get(target);
         if (!meshes) return;

         for (let i = 0; i < meshes.length; i++) {
            const { mesh, index } = meshes[i];
            mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
               mesh.morphTargetInfluences![index],
               value,
               speed
            );
         }
      },
      [morphTargetCache]
   );

   useFrame(state => {
      if (morphTargetCache.current.size === 0) return;
      const time = state.clock.getElapsedTime();

      lerpMorphTarget("eyeBlinkLeft", blinkRef.current || winkLeft ? 1 : 0, 0.5);
      lerpMorphTarget("eyeBlinkRight", blinkRef.current || winkRight ? 1 : 0, 0.5);

      const subtleSmile = Math.sin(time * 0.2) * 0.18 + Math.cos(time * 0.5) * 0.18;
      const asymmetryOffset = Math.sin(time * 0.15) * 0.07;
      lerpMorphTarget("mouthSmileLeft", Math.max(0, subtleSmile + asymmetryOffset), 0.3);
      lerpMorphTarget("mouthSmileRight", Math.max(0, subtleSmile - asymmetryOffset), 0.3);

      if (setupMode || !lipsyncManager) {
         return;
      }

      const viseme = lipsyncManager.viseme;
      const lipsyncState = (lipsyncManager as any).state;
      const activeSpeed = lipsyncState === "vowel" ? 0.2 : 0.4;
      const inactiveSpeed = lipsyncState === "vowel" ? 0.1 : 0.2;

      lerpMorphTarget(viseme, 1, activeSpeed);

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

   return { winkLeft, setWinkLeft, winkRight, setWinkRight };
};
