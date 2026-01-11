import { type NextRequest, NextResponse } from "next/server";

interface Country {
  name: {
    common: string;
    official: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const search = (request.nextUrl.searchParams.get("search") || "").toLowerCase();

    const countriesRes = await fetch(`https://restcountries.com/v3.1/name/${search}`);
    const countries = await countriesRes.json();

    if (countries.status === 404) {
      return NextResponse.json({ suggestions: [] });
    }

    const list = countries.reduce((acc: string[], country: Country) => {
      if (country.name.common.toLowerCase().includes(search)) {
        acc.push(country.name.common);
      }
      return acc;
    }, []);

    return NextResponse.json({ suggestions: list });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return new NextResponse(message, { status: 500 });
  }
}
