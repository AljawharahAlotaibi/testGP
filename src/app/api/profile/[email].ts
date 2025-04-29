import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/db";
import User from "@/modules/auth/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("⚡ API called for profile operation");
  await dbConnect();

  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email parameter" });
  }

  try {
    if (req.method === "GET") {
      const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") }).lean();
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    }

    if (req.method === "PUT") {
      const updatedUser = await User.findOneAndUpdate(
        { email: new RegExp(`^${email}$`, "i") },
        { $set: req.body },
        { new: true }
      );
      return res.status(updatedUser ? 200 : 404).json(updatedUser || { error: "User not found" });
    }

    if (req.method === "DELETE") {
      const deletedUser = await User.findOneAndDelete({ email: new RegExp(`^${email}$`, "i") });
      if (!deletedUser) return res.status(404).json({ error: "User not found" });
      return res.status(200).json({ message: "User deleted successfully" });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("🔥 API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

