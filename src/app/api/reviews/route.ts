// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Review from "@/modules/reviews/models/Review";

export async function GET(request: NextRequest) {
  try {
    // 1) Check session
    const session = await getServerSession({
        req: request,
        ...authOptions
      });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse query string: e.g. ?source=google&placeId=XYZ
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const placeId = searchParams.get("placeId");

    if (!source || !placeId) {
      return NextResponse.json(
        { error: "Missing source or placeId in query" },
        { status: 400 }
      );
    }

    // 3) Connect DB
    await dbConnect();

    // 4) Query reviews
    const reviews = await Review.find({
      userId: session.user.id,
      source,
      placeId,
    }).sort({ createdAt: -1 }); // or any other sort

    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("Get reviews error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
