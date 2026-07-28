import { NextRequest, NextResponse } from "next/server";
import { registerFair } from "@/lib/server/db";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { fair, error } = await registerFair(params.id);
  if (error) return NextResponse.json({ error }, { status: 409 });
  return NextResponse.json({ fair });
}
