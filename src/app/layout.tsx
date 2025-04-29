import "./globals.css";           // Load Tailwind base/global styles
import { Providers } from "./providers"; // The client component above
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Next.js 13 App",
  description: "An example with Chakra + Tailwind + NextAuth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap everything in our Providers component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}