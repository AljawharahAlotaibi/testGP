import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  businessName: { type: String, required: false },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetToken : { type: String , required: false}
});

// Change the collection name from "Users" to "users"
export default mongoose.models.users || mongoose.model("users", UserSchema, "users");


