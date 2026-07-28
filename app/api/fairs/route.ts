import { NextRequest, NextResponse } from "next/server";
import { readFairs, createFair } from "@/lib/server/db";
import { validateFairInput } from "@/lib/server/validate";

export async function GET() {
  const fairs = await readFairs();
  return NextResponse.json({ fairs });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const error = validateFairInput(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const fair = await createFair({
    title: body.title.trim(),
    type: body.type,
    date: body.date,
    location: body.location.trim(),
    description: (body.description ?? "").trim(),
    capacity: body.capacity,
    status: body.status,
  });

  return NextResponse.json({ fair }, { status: 201 });
}
