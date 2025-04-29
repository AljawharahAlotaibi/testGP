import { Schema, model, models } from "mongoose";

const AnalyzedReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, enum: ["google", "foursquare"], required: true },
    placeId: { type: String, required: true },

    // Actual text from the raw review
    text: { type: String, default: "" },
    authorName: { type: String, default: "" },
    // The "stars" or numeric rating if we have it from Google (0 if from Foursquare)
    rating: { type: Number, default: 0 },

    // The final sentiment (positive/neutral/negative) after analyzing
    sentiment: { type: String, enum: ["positive", "neutral", "negative"], required: true },

    // A date or relative time. We store a real Date so we can do monthly stats, etc.
    createdAtTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.AnalyzedReview || model("AnalyzedReview", AnalyzedReviewSchema);