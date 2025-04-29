// src/app/api/auth/connect-google/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";

/**
 * This route initiates the Google OAuth flow with the "business.manage" scope.
 * It expects a GET request and redirects the user to Google's consent screen.
 */
export async function GET(request: NextRequest) {
  // (Optional) If you want the user to be logged in (NextAuth session) first:
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Create your OAuth2 client with environment variables
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI! // e.g. "https://yourapp.vercel.app/api/auth/google-callback"
  );

  // Generate the Google consent URL
  const scopes = ["https://www.googleapis.com/auth/business.manage"];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  // Redirect to Google
  return NextResponse.redirect(authUrl);
}