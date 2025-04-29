// modules/auth/models/User.ts
import mongoose, { Model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  phone: string;
  acceptedTerms: boolean;
  businessName?: string;
  menuFilePath?: string;
  profilePhotoPath?: string;
  createdAt?: Date;
  resetToken?: string;
  googlePlaceId?: string;
  foursquareVenueId?: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  acceptedTerms: {
    type: Boolean,
    default: false,
  },
  businessName: {
    type: String,
    default: "",
  },
  menuFilePath: {
    type: String,
    default: "",
  },
  profilePhotoPath: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetToken: {
    type: String,
    required: false,
  },
  googlePlaceId: { type: String, default: "" },
  foursquareVenueId: { type: String, default: "" },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;