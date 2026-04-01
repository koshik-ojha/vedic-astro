// app/api/horoscope/daily/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sign = searchParams.get("sign");

  if (!sign) {
    return Response.json({ error: "sign is required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/weekly?sign=${encodeURIComponent(sign)}`,
      {
        headers: {
          // Some APIs require a real User-Agent from a browser
          "User-Agent": "Mozilla/5.0 (compatible; NextJS-proxy/1.0)",
          "Accept": "application/json",
        },
        // Don't cache stale readings — horoscopes change daily
        next: { revalidate: 3600 }, // cache 1 hour server-side
      }
    );

    if (!upstream.ok) {
      return Response.json(
        { error: `Upstream error: ${upstream.status} ${upstream.statusText}` },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}