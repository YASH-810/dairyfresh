import { NextResponse } from "next/server";
import { z } from "zod";
import { buildX12_997 } from "@/lib/edi";

// Simulated supplier EDI endpoint: real trading partners would need a VAN (see
// CLAUDE.md "EDI Implementation (simulated)"). This stands in for the vendor's system
// acknowledging our 850 Purchase Order with a 997 Functional Acknowledgement.
const bodySchema = z.object({
  poId: z.string().min(1),
  vendorId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const { poId, vendorId } = parsed.data;
  const doc = buildX12_997(poId, vendorId);
  return NextResponse.json(doc);
}
