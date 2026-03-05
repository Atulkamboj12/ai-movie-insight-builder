"use client";

import { useState } from "react";

export default function Home() {
  const [imdbId, setImdbId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchMovie = async () => {
    if (!imdbId) return;

    setLoading(true);

    const res = await fetch("/api/movie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imdbId }),
    });

    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  const clearMovie = () => {
    setData(null);
    setImdbId("");
  };

  return (
    <div>

      {/* HERO SECTION */}

      <div className="hero">

        <h1>🎬 AI Movie Insight Builder</h1>

        <p>Analyze audience reviews and sentiment for any movie</p>

        <div className="searchBox">

          <input
            placeholder="Enter IMDb ID (tt3896198)"
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
          />

          <button
            className="btn btn-blue"
            onClick={fetchMovie}
          >
            Analyze
          </button>

          {data && (
            <button
              className="btn btn-red"
              onClick={clearMovie}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="container">

        {loading && <p>Analyzing movie...</p>}

        {data && (

          <div>

            {/* MOVIE CARD */}

            <div className="movieCard">

              <img
                src={data.poster}
                className="poster"
              />

              <div>

                <h2>{data.title}</h2>

                <p><b>Year:</b> {data.year}</p>

                <p><b>Rating:</b> ⭐ {data.rating}</p>

                <p><b>Cast:</b> {data.cast}</p>

                <p>
                  <b>Plot:</b> {data.plot}
                </p>

              </div>

            </div>

            {/* AUDIENCE INSIGHT */}

            <div className="insight">

              <h3>📊 Audience Insight</h3>

              <p>{data.ai_summary}</p>

              {data.ai_summary.includes("Positive") && (
                <span className="badge positive">🟢 Positive</span>
              )}

              {data.ai_summary.includes("Mixed") && (
                <span className="badge mixed">🟡 Mixed</span>
              )}

              {data.ai_summary.includes("Negative") && (
                <span className="badge negative">🔴 Negative</span>
              )}

            </div>

            {/* REVIEWS */}

            <h3 style={{ marginTop: "30px" }}>💬 Audience Reviews</h3>

            <div style={{ maxWidth: "900px", margin: "auto" }}>

              {data.reviews.map((review: string, index: number) => (

                <div key={index} className="review">

                  <b>Review {index + 1}:</b> {review}

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}