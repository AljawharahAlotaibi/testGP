import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
// import Users from "../../../models/users"; // Ensure correct path for the model
import User from '../../../modules/auth/models/User';

const JWT_SECRET = "your-secret-key"; // Replace with your actual secret

export async function POST(req: Request) {
    try {
        await dbConnect(); // Connect to the database

        // Get the token and new password from the request body
        const { token, password } = await req.json();

        // Check if the token or password is missing
        if (!token || !password) {
            return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
        }

        // Verify the token and decode it
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Find the user by email from the decoded token
        const user = await User.findOne({ email: decoded.email }); // i replaced Users with User
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        user.resetToken = ""; // Clear the reset token after password reset
        await user.save(); // Save the updated user

        return NextResponse.json({ message: "Password has been reset successfully" }, { status: 200 });

    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

