import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string;
    businessName?: string;
    googlePlaceId?: string;
    foursquareVenueId?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string;
      businessName?: string;
      googlePlaceId?: string;
      foursquareVenueId?: string;
    };
  }
}
