import { isCameraSettledAtom } from "@/atoms";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import * as THREE from "three";

interface Props {
   actions: {
      [x: string]: THREE.AnimationAction | null;
   };
}

export const useAvatarAnimations = ({ actions }: Props) => {
   const [currentAction, setCurrentAction] = useState<string>("sad");
   const cameraSettled = useAtomValue(isCameraSettledAtom);

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

   return {
      currentAction,
      setCurrentAction,
   };
};
