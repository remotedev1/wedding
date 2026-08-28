import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { setupApiHandler } from "@/lib/api/helpers";

function client() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) throw new Error("ImageKit is not configured");
  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

export async function GET(request) {
  try {
    const setup = await setupApiHandler(request, "media:manage", {
      enforceRegisteredPolicy: true,
      sameOriginMutation: false,
    });
    if (setup.error) return setup.error;
    return NextResponse.json(client().getAuthenticationParameters());
  } catch {
    return NextResponse.json({ error: "Image upload authentication is unavailable" }, { status: 503 });
  }
}
