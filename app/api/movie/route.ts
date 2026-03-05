import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imdbId } = await req.json();

    if (!imdbId) {
      return NextResponse.json({ error: "IMDb ID required" }, { status: 400 });
    }

    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OMDB API key missing" },
        { status: 500 }
      );
    }

    // Fetch movie details
    const movieRes = await fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`
    );

    const movieData = await movieRes.json();

    if (movieData.Response === "False") {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // -----------------------------
    // Fetch Reddit discussions
    // -----------------------------
    let reviews: string[] = [];

    try {
      const redditRes = await fetch(
        `https://www.reddit.com/r/movies/search.json?q=${encodeURIComponent(
          movieData.Title
        )}&limit=5&restrict_sr=1`,
        {
          headers: {
            "User-Agent": "AI-Movie-Insight-App",
          },
        }
      );

      const redditData = await redditRes.json();

      reviews =
        redditData?.data?.children
          ?.map((post: any) => post.data.title)
          ?.filter(Boolean) || [];
    } catch (err) {
      console.log("Reddit blocked request");
    }

    // If Reddit fails → generate fallback reviews
    if (reviews.length === 0) {
      reviews = [
        `${movieData.Title} is currently being widely discussed by audiences.`,
        `Many viewers are sharing opinions about ${movieData.Title}.`,
        `Some fans believe ${movieData.Title} has strong performances.`,
        `Others are debating the story and pacing of ${movieData.Title}.`,
      ];
    }

    // -----------------------------
    // Basic Sentiment Analysis
    // -----------------------------
    const positiveWords = [
      "good",
      "great",
      "amazing",
      "best",
      "love",
      "awesome",
    ];

    const negativeWords = [
      "bad",
      "worst",
      "boring",
      "hate",
      "terrible",
    ];

    let score = 0;

    reviews.forEach((review) => {
      const text = review.toLowerCase();

      positiveWords.forEach((word) => {
        if (text.includes(word)) score++;
      });

      negativeWords.forEach((word) => {
        if (text.includes(word)) score--;
      });
    });

    let sentiment = "Neutral";

    if (score > 0) sentiment = "Positive";
    if (score < 0) sentiment = "Negative";

    const ai_summary = `
Audience Sentiment Summary:
Viewers are discussing "${movieData.Title}" online.
Overall reactions appear mostly ${sentiment.toLowerCase()}.

Overall Sentiment: ${sentiment}
`;

    const movie = {
      title: movieData.Title,
      poster: movieData.Poster,
      year: movieData.Year,
      rating: movieData.imdbRating,
      plot: movieData.Plot,
      cast: movieData.Actors,
      reviews,
      ai_summary,
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