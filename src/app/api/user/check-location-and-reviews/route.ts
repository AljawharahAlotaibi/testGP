import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import User from "@/modules/auth/models/User";
import AnalyzedReview from "@/modules/reviews/models/AnalyzedReview";
import { Session } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession({
        req: request,
        ...authOptions
      });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1) Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) Check location
    const hasLocation = !!(user.googlePlaceId || user.foursquareVenueId);

    // 3) Check if user has any analyzed reviews
    const hasAnalyzed = await AnalyzedReview.exists({ userId: user._id });

    return NextResponse.json({
      hasLocation,
      hasAnalyzedReviews: !!hasAnalyzed,
    });
  } catch (err: any) {
    console.error("check-location-and-reviews error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}