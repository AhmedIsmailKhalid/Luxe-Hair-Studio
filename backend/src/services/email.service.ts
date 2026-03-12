import { resend } from '../lib/resend.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

interface BookingEmailData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
}

// In dev we always deliver to the owner's email since we're on Resend's test domain
function resolveRecipient(clientEmail: string): string {
  return env.NODE_ENV === 'production' ? clientEmail : (env.RESEND_DEV_TO ?? clientEmail);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function confirmationEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation — Luxe Hair Studio</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#15803d,#22c55e);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                Luxe Hair Studio
              </h1>
              <p style="margin:8px 0 0;color:#dcfce7;font-size:14px;">
                Your appointment is confirmed
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;">
                Hi <strong>${data.clientName}</strong>,
              </p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                We're looking forward to seeing you. Here are your appointment details:
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
                          <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Service</span><br>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${data.serviceName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
                          <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Stylist</span><br>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${data.staffName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
                          <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Date</span><br>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${formatDate(data.date)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #dcfce7;">
                          <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Time</span><br>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${formatTime(data.startTime)} — ${formatTime(data.endTime)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Total</span><br>
                          <span style="color:#15803d;font-size:18px;font-weight:700;">$${data.totalPrice}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booking Reference -->
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-align:center;">
                Booking Reference
              </p>
              <p style="margin:0 0 32px;color:#111827;font-size:13px;font-weight:600;text-align:center;
                font-family:monospace;background:#f3f4f6;padding:8px 16px;border-radius:6px;display:inline-block;">
                ${data.bookingId.toUpperCase().slice(0, 8)}
              </p>

              <!-- CTA -->
              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                Need to make changes? Contact us at
                <a href="mailto:hello@luxehairstudio.com" style="color:#15803d;text-decoration:none;">
                  hello@luxehairstudio.com
                </a>
                or call us at <strong>(555) 000-1234</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 Luxe Hair Studio · 123 Salon Street, New York, NY 10001
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function cancellationEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled — Luxe Hair Studio</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:#374151;padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Luxe Hair Studio</h1>
              <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">Your appointment has been cancelled</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;">
                Hi <strong>${data.clientName}</strong>,
              </p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Your appointment has been cancelled. Details of the cancelled booking are below.
              </p>

              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Service</p>
                    <p style="margin:0 0 16px;color:#111827;font-size:15px;font-weight:600;">${data.serviceName}</p>
                    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Date & Time</p>
                    <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">
                      ${formatDate(data.date)} at ${formatTime(data.startTime)}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                We'd love to see you again. Book a new appointment at any time at
                <a href="http://localhost:5173/book" style="color:#15803d;text-decoration:none;">
                  our website
                </a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 Luxe Hair Studio · 123 Salon Street, New York, NY 10001
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── Public Email Functions ───────────────────────────────────────────────────

export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  const recipient = resolveRecipient(data.clientEmail);

  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to: recipient,
      subject: `Appointment Confirmed — ${data.serviceName} on ${formatDate(data.date)}`,
      html: confirmationEmailHtml(data),
    });

    logger.info(`Confirmation email sent`, {
      bookingId: data.bookingId,
      recipient,
      emailId: result.data?.id,
    });
  } catch (err) {
    // Email failure should never block a successful booking
    logger.error(`Failed to send confirmation email`, {
      bookingId: data.bookingId,
      error: err,
    });
  }
}

export async function sendBookingCancellation(data: BookingEmailData): Promise<void> {
  const recipient = resolveRecipient(data.clientEmail);

  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to: recipient,
      subject: `Appointment Cancelled — ${data.serviceName} on ${formatDate(data.date)}`,
      html: cancellationEmailHtml(data),
    });

    logger.info(`Cancellation email sent`, {
      bookingId: data.bookingId,
      recipient,
      emailId: result.data?.id,
    });
  } catch (err) {
    logger.error(`Failed to send cancellation email`, {
      bookingId: data.bookingId,
      error: err,
    });
  }
}