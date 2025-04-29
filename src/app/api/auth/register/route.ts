import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/modules/auth/models/User";
import bcrypt from "bcryptjs";

interface RegisterBody {
  email: string;
  phone: string;
  password: string;
  acceptedTerms: boolean;
  businessName?: string;
  profilePhotoPath?: string;
  menuFilePath?: string;
  googlePlaceId?: string;
  foursquareVenueId?: string;
}

// Named export for the POST method
export async function POST(request: NextRequest) {
  try {
    // 1) Connect to DB
    await dbConnect();

    // 2) Parse the request body
    const body = await request.json();
    const {
      email,
      phone,
      password,
      acceptedTerms,
      businessName,
      profilePhotoPath,
      menuFilePath,
      googlePlaceId,
      foursquareVenueId,
    } = body as RegisterBody;

    // 3) Basic validations
    if (!email || !phone || !password) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    if (!acceptedTerms) {
      return NextResponse.json({ message: "You must accept terms." }, { status: 400 });
    }

    // 4) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use." }, { status: 400 });
    }

    // 5) Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6) Create new user
    const newUser = new User({
      email,
      phone, // e.g. "KSA+966-555123456"
      password: hashedPassword,
      acceptedTerms: true, // store acceptance
      businessName: businessName || "",
      profilePhotoPath: profilePhotoPath || "",
      menuFilePath: menuFilePath || "",
      googlePlaceId: googlePlaceId || "",
      foursquareVenueId: foursquareVenueId || "",
    });

    await newUser.save();

    // 7) Return success response
    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}