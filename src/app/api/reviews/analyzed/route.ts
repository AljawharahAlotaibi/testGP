import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import AnalyzedReview from "@/modules/reviews/models/AnalyzedReview";

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

    const userId = session.user.id;

    // Return all analyzed reviews for the user
    const docs = await AnalyzedReview.find({ userId })
      .sort({ createdAtTime: -1 })
      .lean();

    return NextResponse.json(docs);
  } catch (err: any) {
    console.error("GET /api/reviews/analyzed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}