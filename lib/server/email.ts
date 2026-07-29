import { Resend } from "resend";
import { CareerFair } from "@/lib/types";
import { formatFullDate } from "@/lib/dateUtils";

// Lazily constructed so a missing key doesn't crash module load / seeding.
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set.");
    resend = new Resend(key);
  }
  return resend;
}

/**
 * Sends a registration confirmation email. Callers should treat failures as
 * non-fatal to the registration itself — the seat is already claimed by the
 * time this runs, so an email error shouldn't roll that back.
 */
export async function sendRegistrationConfirmation(params: {
  to: string;
  name: string;
  fair: CareerFair;
}): Promise<void> {
  const { to, name, fair } = params;
  const fromAddress = process.env.EMAIL_FROM ?? "TalentBank <onboarding@resend.dev>";

  await getResend().emails.send({
    from: fromAddress,
    to,
    subject: `You're registered: ${fair.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>You're confirmed for <strong>${escapeHtml(fair.title)}</strong>.</p>
        <p style="margin: 16px 0; padding: 12px 16px; background: #f5f5f0; border-radius: 4px;">
          <strong>${escapeHtml(fair.title)}</strong><br />
          ${formatFullDate(fair.date)}<br />
          ${escapeHtml(fair.location)}
        </p>
        <p>See you there!</p>
      </div>
    `,
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
