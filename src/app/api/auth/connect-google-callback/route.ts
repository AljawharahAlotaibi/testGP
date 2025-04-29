// src/app/api/auth/connect-google-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import User from "@/modules/auth/models/User";
import { google } from "googleapis";

/**
 * Google calls back here with ?code=...
 * We exchange the code for tokens, store them in DB.
 */
export async function GET(request: NextRequest) {
  // Must have a logged-in user session to know whom to store tokens for
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Grab the code
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Connect to DB, store tokens
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.googleAccessToken = tokens.access_token || "";
    user.googleRefreshToken = tokens.refresh_token || "";
    await user.save();

    // Redirect user to your dashboard or wherever
    const redirectUrl = new URL("/dashboard/home", request.url);
    return NextResponse.redirect(redirectUrl);

  } catch (err) {
    console.error("Token exchange error:", err);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
  }
}