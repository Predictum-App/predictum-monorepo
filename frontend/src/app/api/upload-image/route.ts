import { NextResponse } from "next/server";

import { uploadImageToIPFS } from "@/lib/pinata";

export async function POST(req: Request): Promise<NextResponse<string | null>> {
  try {
    const formData = await req.formData();
    const image = formData.get("file") as File;

    if (!image) {
      return NextResponse.json<string>("No image file provided", { status: 400 });
    }

    const imageCID = await uploadImageToIPFS(image);

    if (!imageCID) {
      return NextResponse.json<string>("Failed to upload image to IPFS", { status: 400 });
    }

    return NextResponse.json<string>(imageCID);
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return NextResponse.json<string>("Failed to process image upload", { status: 400 });
  }
}
