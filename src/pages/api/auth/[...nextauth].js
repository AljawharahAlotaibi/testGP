// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/db";
import User from "../../../modules/auth/models/User";

export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const { email, password } = credentials;

        const user = await User.findOne({ email });
        if (!user) throw new Error("No user found.");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid password.");

        return {
          id: user._id.toString(),
          businessName: user.businessName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.businessName = user.businessName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        businessName: token.businessName ?? "Unknown Business",
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
