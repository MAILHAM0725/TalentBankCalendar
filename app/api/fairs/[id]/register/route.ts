import { NextRequest, NextResponse } from "next/server";
import { registerFair } from "@/lib/server/db";
import { validateRegistrationInput } from "@/lib/server/validate";
import { sendRegistrationConfirmation } from "@/lib/server/email";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const validationError = validateRegistrationInput(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();

  const { fair, error } = await registerFair(params.id, name, email);
  if (error) return NextResponse.json({ error }, { status: 409 });

  try {
    await sendRegistrationConfirmation({ to: email, name, fair: fair! });
  } catch (err) {
    console.error("Failed to send registration confirmation email:", err);
  }

  return NextResponse.json({ fair });
}