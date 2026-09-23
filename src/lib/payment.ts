// ponytail: no Razorpay keys configured yet (see CLAUDE.md env vars) — simulated locally.
// Swap for real window.Razorpay Checkout + server-side signature verification
// (api/razorpay/webhook) once RAZORPAY_KEY_ID/SECRET/RAZORPAY_WEBHOOK_SECRET exist.
export function simulateRazorpayCheckout(): Promise<{ success: true }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 900));
}
