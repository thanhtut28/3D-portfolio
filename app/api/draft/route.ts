import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   const { searchParams } = new URL(request.url);

   const secret = searchParams.get("secret");
   const slug = searchParams.get("slug");

   if (!secret || secret !== process.env.CONTENTFUL_PREVIEW_SECRET || !slug) {
      return new NextResponse("Invalid token", { status: 401 });
   }

   const draft = await draftMode();
   draft.enable();

   // Redirect to the post page for the given slug
   return NextResponse.redirect(new URL(`/posts/${slug}`, request.url));
}
