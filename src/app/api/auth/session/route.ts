import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Plain GET so StoreProvider can check the session on mount; calling the Server Action
// directly from a mount effect throws React #441 (Server Function during initial render).
export async function GET() {
  return NextResponse.json({ user: await getSessionUser() });
}
