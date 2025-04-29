// modules/reviews/models/Review.ts
import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, enum: ["google", "foursquare"], required: true },
    placeId: { type: String, required: true },
    authorName: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    text: { type: String, default: "" },
    relativeTimeDescription: { type: String, default: "" },
    fsqUser: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Review || model("Review", ReviewSchema);
