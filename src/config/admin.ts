// Configure which emails are allowed to access the admin area
// You can also set VITE_ADMIN_EMAILS="email1@example.com,email2@example.com" in your .env.local
const envEmails = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [];

export const allowedAdminEmails: string[] = envEmails.length ? envEmails : [
  'info@globalxtltd.com',
  'orevaorior@gmail.com',
];
