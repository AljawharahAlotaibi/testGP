import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/modules/auth/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1) Connect to DB
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 2) Find user
        const userDoc = await User.findOne({ email: credentials.email });
        if (!userDoc) {
          throw new Error("Invalid email or password");
        }

        // 3) Compare passwords
        const isValid = await bcrypt.compare(credentials.password, userDoc.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // 4) Return user object with extra fields
        return {
          id: userDoc._id.toString(),
          email: userDoc.email,
          businessName: userDoc.businessName,
          googlePlaceId: userDoc.googlePlaceId,
          foursquareVenueId: userDoc.foursquareVenueId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.businessName = user.businessName;
        token.googlePlaceId = user.googlePlaceId;
        token.foursquareVenueId = user.foursquareVenueId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.email) session.user.email = token.email as string;
      if (token.businessName) session.user.businessName = token.businessName as string;
      if (token.googlePlaceId) session.user.googlePlaceId = token.googlePlaceId as string;
      if (token.foursquareVenueId) session.user.foursquareVenueId = token.foursquareVenueId as string;
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};