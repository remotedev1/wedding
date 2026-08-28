import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readJsonRequest, setupApiHandler } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";

export async function POST(request, { params }) {
  const setup = await setupApiHandler(request, "blog:comment", {
    requireAuthentication: false,
    rateLimitPreset: RATE_LIMIT_PRESETS.PUBLIC_API,
  });
  if (setup.error) return setup.error;

  const body = await readJsonRequest(request, 16 * 1024);
  const author = String(body?.author || "").trim().slice(0,100);
  const email = String(body?.email || "").trim().toLowerCase().slice(0,254);
  const content = String(body?.content || "").trim().slice(0,4000);
  if (author.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || content.length < 2) {
    return NextResponse.json({ error: "Valid author, email and comment are required." }, { status: 400 });
  }
  const post = await db.blogPost.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const comment = await db.comment.create({ data: { postId: post.id, author, email, content } });
  return NextResponse.json(comment, { status: 201 });
}
