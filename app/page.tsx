"use client";

import { useState } from "react";

export default function Home() {
  const [imdbId, setImdbId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMovie = async () => {
    if (!imdbId) return;

    setLoading(true);

    try {
      const res = await fetch("/api/movie", {
        method: "POST",
        body: JSON.stringify({ imdbId }),
      });

      const result = await res.json();
      setData(result);
    } catch {
      alert("Error fetching movie.");
    }

    setLoading(false);
  };

  const clearData = () => {
    setData(null);
    setImdbId("");
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <h1>🎬 AI Movie Insight Builder</h1>
        <p>Analyze audience reviews and sentiment for any movie</p>

        <div className="searchBox">
          <input
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
            placeholder="Enter IMDb ID (tt3896198)"
          />

          <button onClick={analyzeMovie}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          <button className="clearBtn" onClick={clearData}>
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="container">
        {data && (
          <>
            {/* Movie Card */}
            <div className="movieCard">
              <img src={data.poster} alt="poster" />

              <div>
                <h2>{data.title}</h2>
                <p>
                  <b>Year:</b> {data.year}
                </p>
                <p>
                  <b>Rating:</b> ⭐ {data.rating}
                </p>
                <p>
                  <b>Cast:</b> {data.cast}
                </p>
                <p>
                  <b>Plot:</b> {data.plot}
                </p>
              </div>
            </div>

            {/* AI Insight */}
            <div className="insightBox">
              <h3>📊 Audience Insight</h3>
              <p>{data.ai_summary}</p>
            </div>

            {/* Reviews */}
            <h3 style={{ marginTop: "30px" }}>💬 Audience Reviews</h3>

            <div className="reviews">
              {data.reviews?.map((review: string, index: number) => (
                <div key={index} className="review">
                  {review}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}