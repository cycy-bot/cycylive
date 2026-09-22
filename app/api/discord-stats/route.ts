import { NextResponse } from "next/server";
import { obtenirWidgetDiscord } from "@/lib/discordStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const widget = await obtenirWidgetDiscord();
  return NextResponse.json({
    enLigne: widget?.enLigne ?? null,
    membres: widget?.membres ?? [],
  });
}
