import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { readJsonRequest, setupApiHandler } from "@/lib/api/helpers";

export async function GET() {
  try {
    const tree = await db.familyTree.findFirst({
      orderBy: { updatedAt: "desc" }, // get the latest tree
    });
    return NextResponse.json(tree);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch tree" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const setup = await setupApiHandler(req, "family-tree:manage", { enforceRegisteredPolicy: true });
    if (setup.error) return setup.error;
    const body = await readJsonRequest(req, 256 * 1024);

    // Check if tree already exists
    const existingTree = await db.familyTree.findFirst();

    if (existingTree) {
      // Update the existing tree
      const updatedTree = await db.familyTree.update({
        where: { id: existingTree.id },
        data: { treeData: body.treeData, name: body.name },
      });
      return NextResponse.json(updatedTree);
    } else {
      // Create new tree
      const newTree = await db.familyTree.create({
        data: { treeData: body.treeData, name: body.name },
      });
      return NextResponse.json(newTree);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save tree" }, { status: 500 });
  }
}
