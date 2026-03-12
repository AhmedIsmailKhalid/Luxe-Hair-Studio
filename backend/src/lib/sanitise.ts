/**
 * Strips HTML tags and trims whitespace from a string.
 * Prevents HTML/script injection in emails and stored client data.
 */
export function sanitiseString(value: string): string {
  return value
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&[a-z]+;/gi, '') // strip HTML entities e.g. &lt; &amp;
    .trim();
}

/**
 * Sanitises all free-text client fields from the booking payload.
 */
export function sanitiseBookingInput(data: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}) {
  return {
    clientName: sanitiseString(data.clientName),
    clientEmail: sanitiseString(data.clientEmail),
    clientPhone: sanitiseString(data.clientPhone),
    notes: data.notes ? sanitiseString(data.notes) : undefined,
  };
}