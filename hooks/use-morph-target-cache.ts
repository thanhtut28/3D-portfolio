"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface MorphTargetEntry {
   mesh: THREE.SkinnedMesh;
   index: number;
}

export type MorphTargetCache = Map<string, MorphTargetEntry[]>;

/**
 * Builds and caches morph target references from a Three.js scene.
 * This avoids expensive scene traversal on every frame.
 */
export function useMorphTargetCache(scene: THREE.Object3D) {
   const cacheRef = useRef<MorphTargetCache>(new Map());

   useEffect(() => {
      const cache: MorphTargetCache = new Map();

      scene.traverse(child => {
         const mesh = child as THREE.SkinnedMesh;

         if (!mesh.isSkinnedMesh || !mesh.morphTargetDictionary) {
            return;
         }

         const dictionary = mesh.morphTargetDictionary;
         const influences = mesh.morphTargetInfluences;

         if (!influences) return;

         for (const targetName of Object.keys(dictionary)) {
            const index = dictionary[targetName];

            if (index === undefined || influences[index] === undefined) {
               continue;
            }

            const entries = cache.get(targetName) ?? [];
            entries.push({ mesh, index });
            cache.set(targetName, entries);
         }
      });

      cacheRef.current = cache;
   }, [scene]);

   return cacheRef;
}
