import { CanvasContainer } from "@/components/avatar/canvas-container";
import { getProfile } from "@/lib/api";

export default async function Page() {
   const profileData = await getProfile();

   return <CanvasContainer />;
}
