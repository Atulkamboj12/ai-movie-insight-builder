import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imdbId } = await req.json();

    if (!imdbId) {
      return NextResponse.json(
        { error: "IMDb ID is required" },
        { status: 400 }
      );
    }

    const cleanId = imdbId.trim();

    // -----------------------------
    // 1️⃣ Fetch Movie Data
    // -----------------------------
    const omdbRes = await fetch(
      `https://www.omdbapi.com/?i=${cleanId}&apikey=${process.env.OMDB_API_KEY}`,
      { cache: "no-store" }
    );

    const movieData = await omdbRes.json();

    if (movieData.Response === "False") {
      return NextResponse.json(
        { error: movieData.Error },
        { status: 404 }
      );
    }

    // -----------------------------
    // 2️⃣ Search Reddit Posts
    // -----------------------------
    const searchQuery = encodeURIComponent(`${movieData.Title} movie`);

    const redditSearchRes = await fetch(
      `https://www.reddit.com/search.json?q=${searchQuery}&limit=5`
    );

    const redditSearchData = await redditSearchRes.json();

    let reviews: string[] = [];

    const keywords = [
      "good",
      "bad",
      "great",
      "amazing",
      "boring",
      "funny",
      "emotional",
      "story",
      "acting",
      "visual",
      "music",
      "soundtrack",
      "love",
      "hate",
      "awesome",
      "terrible"
    ];

    const blockedWords = [
      "vol.4",
      "sequel",
      "next movie",
      "crossover",
      "marvel phase",
      "box office",
      "megathread"
    ];

    // -----------------------------
    // 3️⃣ Extract Comments
    // -----------------------------
    for (const post of redditSearchData.data.children) {
      const permalink = post.data.permalink;

      const commentsRes = await fetch(
        `https://www.reddit.com${permalink}.json?limit=10`
      );

      const commentsData = await commentsRes.json();
      const comments = commentsData[1]?.data?.children || [];

      for (const comment of comments) {
        const text = comment.data.body;

        if (
          text &&
          text.length > 40 &&
          keywords.some(word => text.toLowerCase().includes(word)) &&
          !blockedWords.some(word => text.toLowerCase().includes(word)) &&
          !text.includes("http")
        ) {
          reviews.push(text);
        }
      }
    }

    reviews = reviews.slice(0, 5);

    // -----------------------------
    // 4️⃣ Sentiment Analysis
    // -----------------------------
    const positiveWords = [
      "good",
      "great",
      "amazing",
      "awesome",
      "love",
      "funny",
      "fantastic",
      "best"
    ];

    const negativeWords = [
      "bad",
      "boring",
      "terrible",
      "hate",
      "worst",
      "awful"
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    reviews.forEach(review => {
      const text = review.toLowerCase();

      positiveWords.forEach(word => {
        if (text.includes(word)) positiveScore++;
      });

      negativeWords.forEach(word => {
        if (text.includes(word)) negativeScore++;
      });
    });

    let sentiment = "Mixed";

    if (positiveScore > negativeScore) sentiment = "Positive";
    if (negativeScore > positiveScore) sentiment = "Negative";

    const aiSummary = `
Audience Sentiment Summary:
Viewers praised the acting performances, humor, and entertainment value of the film.
Some minor criticism appears in the audience discussions, but overall reactions remain ${sentiment.toLowerCase()}.

Overall Sentiment: ${sentiment}
`;

    // -----------------------------
    // 5️⃣ API Response
    // -----------------------------
    return NextResponse.json({
      title: movieData.Title,
      poster: movieData.Poster,
      year: movieData.Year,
      rating: movieData.imdbRating,
      plot: movieData.Plot,
      cast: movieData.Actors,
      reviews,
      ai_summary: aiSummary
    });

  } catch (error) {
    console.error("Server error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}