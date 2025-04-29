import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
// import Users from "@/models/users";  // Correct model name (lowercase)
import User from '../../../modules/auth/models/User';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

export async function POST(req: Request) {
    try {
        await dbConnect(); // Connect to the database

        // CORS Headers
        const headers = new Headers();
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("Access-Control-Allow-Methods", "POST, OPTIONS");
        headers.append("Access-Control-Allow-Headers", "Content-Type");

        // Parse request body
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400, headers });
        }

        // Query the "users" collection explicitly for the given email
        const user = await User.findOne({ email });  // Correct query for finding the user ((replaced Users with User))

        if (!user) {
            return NextResponse.json({ error: "No user found with this email" }, { status: 404, headers });
        }

        // Compare the password from the request with the hashed password in the database
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401, headers });
        }

        return NextResponse.json(
            { message: "Login successful", user: { id: user._id, email: user.email } },
            { status: 200, headers }
        );

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
