// app/api/foursquare/fetch-and-store-reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Review from "@/modules/reviews/models/Review";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession({
      req: request,
      ...authOptions,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { venueId } = body;
    if (!venueId) {
      return NextResponse.json({ error: "venueId is required" }, { status: 400 });
    }

    await dbConnect();

    const fsqKey = process.env.FOURSQUARE_API_KEY;
    if (!fsqKey) {
      return NextResponse.json({ error: "No Foursquare API key" }, { status: 500 });
    }

    const url = `https://api.foursquare.com/v3/places/${venueId}/tips?limit=20`;
    const fsqRes = await fetch(url, {
      headers: {
        Authorization: fsqKey,
        Accept: "application/json",
      },
    });
    if (!fsqRes.ok) {
      const errorText = await fsqRes.text();
      console.error("Foursquare API error:", errorText);
      return NextResponse.json({ error: errorText }, { status: fsqRes.status });
    }

    // The raw JSON might be an array, not an object
    const data = await fsqRes.json();
    console.log("Foursquare raw JSON =>", JSON.stringify(data, null, 2));

    let tips: any[] = [];
    if (Array.isArray(data)) {
      // data is already an array
      tips = data;
    } else {
      // some endpoints return { tips: [ ... ] } or { results: [ ... ] }
      tips = data.tips || data.results || [];
    }

    console.log("Extracted tips array =>", tips);

    for (const tip of tips) {
      const text = tip.text || "";
      // We'll store the user name in `authorName`
      // If the user field doesn't exist in your data, fallback to "Foursquare User"
      const authorName = tip.user?.name || "Foursquare User";

      // We'll store the creation date/time in `relativeTimeDescription`
      // so it mirrors Google’s field
      const createdAtTime = tip.created_at || "";

      // Avoid duplicates
      const existing = await Review.findOne({
        userId: session.user.id,
        source: "foursquare",
        placeId: venueId,
        text,
      });

      if (!existing) {
        await Review.create({
          userId: session.user.id,
          source: "foursquare",
          placeId: venueId,
          text,
          rating: 0, // no numeric rating from Foursquare tips
          fsqUser: tip.user?.id || "", // store user ID if present
          authorName,
          relativeTimeDescription: createdAtTime,
        });
      }
    }

    return NextResponse.json({
      message: "Foursquare tips fetched & stored!",
      count: tips.length,
    });
  } catch (err: any) {
    console.error("Foursquare fetch-and-store error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}