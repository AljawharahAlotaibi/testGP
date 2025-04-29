// app/api/google/fetch-and-store-reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Review from "@/modules/reviews/models/Review";

export async function POST(request: NextRequest) {
  try {
    // 1) Validate user session
    const session = await getServerSession({ req: request, ...authOptions });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse body
    const body = await request.json();
    const { placeId } = body;
    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }

    // 3) DB connect
    await dbConnect();

    // 4) Google Places API key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No Google Places API key" }, { status: 500 });
    }

    // Helper function to fetch reviews for a given language (ar or en)
    async function fetchReviewsForLanguage(language: string) {
      const fields = "review,rating,user_ratings_total";
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=${language}&key=${apiKey}`;
      const resLang = await fetch(url);
      const dataLang = await resLang.json();

      if (dataLang.status !== "OK") {
        console.error(
          `Google Place Details error (${language}):`,
          dataLang.error_message || dataLang.status
        );
        return [];
      }

      return dataLang.result?.reviews || [];
    }

    // 5) Fetch Arabic reviews
    const arReviews = await fetchReviewsForLanguage("ar");
    // 6) Fetch English reviews
    const enReviews = await fetchReviewsForLanguage("en");

    // Combine them
    const allReviews = [...arReviews, ...enReviews];

    // 7) Store reviews in DB (avoid duplicates by checking same user + text)
    let newCount = 0;
    for (const r of allReviews) {
      const authorName = r.author_name || "Google User";
      const text = r.text || "";
      const existing = await Review.findOne({
        userId: session.user.id, // the “owner” of this location
        source: "google",
        placeId,
        authorName,
        text,
      });

      if (!existing) {
        await Review.create({
          userId: session.user.id,
          source: "google",
          placeId,
          authorName,
          rating: r.rating || 0,
          text,
          relativeTimeDescription: r.relative_time_description || "",
        });
        newCount++;
      }
    }

    return NextResponse.json({
      message: "Google reviews (Arabic & English) fetched & stored!",
      fetchedArabic: arReviews.length,
      fetchedEnglish: enReviews.length,
      newInserted: newCount,
      totalFetched: arReviews.length + enReviews.length,
    });
  } catch (err: any) {
    console.error("Google fetch-and-store error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}