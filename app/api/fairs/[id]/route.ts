import { NextRequest, NextResponse } from "next/server";
import { getFair, updateFair, deleteFair } from "@/lib/server/db";
import { validateFairInput } from "@/lib/server/validate";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const patch = await req.json().catch(() => null);
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existing = await getFair(params.id);
  if (!existing) return NextResponse.json({ error: "Fair not found." }, { status: 404 });

  const merged = { ...existing, ...patch };
  const validationError = validateFairInput(merged);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { fair, error } = await updateFair(params.id, patch);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ fair });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteFair(params.id);
  if (!ok) return NextResponse.json({ error: "Fair not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
