import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Review from "@/modules/reviews/models/Review";
import AnalyzedReview from "@/modules/reviews/models/AnalyzedReview";

const HF_API_KEY = process.env.HF_API_KEY || "";
const HF_ENDPOINT =
  "https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession({
      req: request,
      ...authOptions,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;
    const rawReviews = await Review.find({ userId }).lean();

    let analyzeCount = 0;

    for (const raw of rawReviews) {
      // Skip if we've already analyzed this particular review
      const already = await AnalyzedReview.findOne({
        userId,
        source: raw.source,
        placeId: raw.placeId,
        text: raw.text,
      });
      if (already) continue;

      // -- Run the inference --
      const results = await runInferenceWithRetry(raw.text, 2);
      if (!results) {
        console.warn("No valid results for text:", raw.text);
        continue;
      }

      // If the top-level is an array of arrays, flatten it:
      const flattened =
        Array.isArray(results[0]) && Array.isArray(results[0][0])
          ? // extremely nested, if that ever happens
            results.flat(2)
          : Array.isArray(results[0])
          ? results[0]
          : results;

      console.log("Inference results for:", raw.text, flattened);

      // E.g. flattened might now be:
      // [ { label: '4 stars', score: 0.63 }, { label: '3 stars', score: 0.17 }, ... ]

      if (!Array.isArray(flattened) || flattened.length === 0) {
        console.warn("Flattened results are empty for text:", raw.text, results);
        continue;
      }

      let bestLabel = "";
      let bestScore = 0;

      for (const obj of flattened) {
        if (obj.score > bestScore) {
          bestLabel = obj.label;
          bestScore = obj.score;
        }
      }

      const sentiment = mapStarToSentiment(bestLabel);

      await AnalyzedReview.create({
        userId,
        source: raw.source,
        placeId: raw.placeId,
        text: raw.text,
        authorName: raw.authorName,
        rating: raw.rating,
        sentiment,
        createdAtTime: new Date(),
      });

      analyzeCount++;
    }

    return NextResponse.json({ success: true, analyzed: analyzeCount });
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** 
 * Inference with optional retry
 */
async function runInferenceWithRetry(text: string, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const res = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (res.ok) {
      return await res.json();
    } else {
      const errorText = await res.text();
      console.error(
        `Hugging Face Inference Error (attempt ${attempt}):`,
        errorText
      );
      if (attempt < retries + 1) {
        console.warn(`Retrying... attempt ${attempt + 1} of ${retries + 1}`);
      } else {
        return null;
      }
    }
  }
  return null;
}

function mapStarToSentiment(labelStr: string): string {
  // For the nlptown/bert-base-multilingual-uncased-sentiment model,
  // we expect "X star[s]" (1..5).
  const match = labelStr.match(/^(\d)/);
  if (!match) {
    console.warn("Unexpected sentiment label format:", labelStr);
    return "neutral";
  }

  const star = parseInt(match[1], 10);
  if (star <= 2) return "negative";
  if (star === 3) return "neutral";
  if (star >= 4) return "positive";
  return "neutral";
}