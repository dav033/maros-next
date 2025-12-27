/**
 * N8N Webhook Configuration
 * 
 * This configuration uses the NEXT_PUBLIC_ prefix to make the variable
 * available in the browser/client-side code.
 */
export const N8N_WEBHOOK_URL = 
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? 
  'https://n8n.marosconstruction.com/webhook/';

