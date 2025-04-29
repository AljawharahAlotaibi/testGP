/* import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Users from "../../../models/users"; // Correct path for users model
import dbConnect from "@/lib/db"; // Your db connection

const JWT_SECRET = "your-secret-key";  // Replace with your actual secret

export async function POST(req: Request) {
  try {
    console.log("Starting password reset process...");

    // Connect to the database
    await dbConnect();
    console.log("Database connected successfully.");

    // Get email from request body
    const { email } = await req.json();

    if (!email) {
      console.log("No email provided.");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email in the database
    const user = await Users.findOne({ email });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
    }

    // Create a reset token using JWT
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    console.log(`Generated reset token for email: ${email}`);

    // Set up Nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: "gmail",  // Using Gmail's SMTP server
      auth: {
        user: "9viiiiii2222@gmail.com",  // Your Gmail email address
        pass: "Kmry4248224",  // Your Gmail password or app password if 2FA is enabled
      },
    });

    // Mail options for sending the reset link
    const mailOptions = {
      from: "9viiiiii2222@gmail.com",  // Your Gmail email address
      to: email,  // User's email address
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:\n\nhttp://localhost:3000/reset-password?token=${resetToken}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Reset link sent to: ${email}`);

    return NextResponse.json(
      { message: "Password reset link sent successfully. Check your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot password API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
*/ 
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
// import Users from "@/models/users";
import User from '../../../modules/auth/models/User';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
const JWT_SECRET = "your-secret-key";  // Replace with your secret

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
        await dbConnect(); // الاتصال بقاعدة البيانات

        // إعداد ترويسات CORS
        const headers = new Headers();
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("Access-Control-Allow-Methods", "POST, OPTIONS");
        headers.append("Access-Control-Allow-Headers", "Content-Type");

        // تحليل البيانات القادمة في الطلب
        const { email } = await req.json();
        console.log("Received email:", email);

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400, headers });
        }

        // البحث عن المستخدم بناءً على البريد الإلكتروني
        const user = await User.findOne({ email }); // i replaced Users with User

        if (!user) {
            return NextResponse.json({ error: "No user found with this email" }, { status: 404, headers });
        }

        // Create a reset token using JWT
        const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

        // Save the token to the user's profile (optional)
        user.resetToken = resetToken;
        await user.save();

        // Set up Nodemailer to send the email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'loayalimahmoud@gmail.com', // we should replace it with our email
                pass: 'tyci uqzn kyty kals',       // our email password
            },
        });

        // Mail options
        const mailOptions = {
            from: "loayalimahmoud@gmail.com",
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link below to reset your password:\n\nhttp://localhost:3000/reset-password?token=${resetToken}`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        

        return NextResponse.json(
            { message: "Password reset link sent successfully" },
            { status: 200, headers }
        );

    } catch (error) {
        console.error("Forgot Password error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
