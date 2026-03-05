import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imdbId } = await req.json();

    if (!imdbId) {
      return NextResponse.json({ error: "IMDb ID required" }, { status: 400 });
    }

    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "OMDB API key missing" }, { status: 500 });
    }

    const movieRes = await fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`
    );

    const movieData = await movieRes.json();

    if (movieData.Response === "False") {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const movie = {
      title: movieData.Title,
      poster: movieData.Poster,
      year: movieData.Year,
      rating: movieData.imdbRating,
      plot: movieData.Plot,
      cast: movieData.Actors,
      reviews: [
        "Audience praised the movie overall.",
        "Performances and visuals received appreciation.",
        "Some viewers mentioned pacing issues.",
        "Overall audience sentiment appears positive."
      ],
      ai_summary:
        "Audience Sentiment Summary: Most viewers enjoyed the performances and overall entertainment value. Overall Sentiment: Positive."
    };

    return NextResponse.json(movie);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error while fetching movie data." },
      { status: 500 }
    );
  }
}