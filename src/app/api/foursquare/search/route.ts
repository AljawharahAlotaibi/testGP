import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const fsqKey = process.env.FOURSQUARE_API_KEY;
  if (!fsqKey) {
    return NextResponse.json({ error: "No Foursquare API key" }, { status: 500 });
  }

  const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=300&limit=10&query=restaurant,cafe,coffee,bistro`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: fsqKey },
    });
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ venues: data.results || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}