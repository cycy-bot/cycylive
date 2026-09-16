import { NextResponse } from "next/server";
import { obtenirNombreFollowers, estConnecteeATwitch } from "@/lib/twitchOAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const connecte = await estConnecteeATwitch();
  const followers = connecte ? await obtenirNombreFollowers() : null;
  return NextResponse.json({ connecte, followers });
}
