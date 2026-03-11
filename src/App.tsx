import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Trophy,
  Target,
  CalendarDays,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import "./App.css";

type Leader = {
  name: string;
  doors: number;
};

type LeaderboardResponse = {
  weekLabel: string;
  updatedAt: string;
  goal: number;
  totalDoors: number;
  leaders: Leader[];
};

const API_URL = "https://script.google.com/macros/s/AKfycbykaWSDmPRUhnobZnEBJn0fBEwv2RPTgn1GmtTJdO4krW6ALD9JilhrjzmQfw7jGiBoww/exec";
const LOGO_URL = "/logo.png";
const SIGNUP_URL = "https://www.mobilize.us/okdemocrats/event/910434/";

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export default function App() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  async function loadLeaderboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const json = await res.json();

      if (!json || !Array.isArray(json.leaders)) {
        throw new Error("Invalid response data");
      }

      setData(json);
    } catch (err) {
      console.error(err);
      setError("Could not load leaderboard data yet. Double-check your Google Apps Script URL.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const progress = useMemo(() => {
    if (!data?.goal) return 0;
    return Math.min(100, Math.round((data.totalDoors / data.goal) * 100));
  }, [data]);

  const remainingDoors = data ? Math.max(0, data.goal - data.totalDoors) : 0;
  const topThree = data?.leaders?.slice(0, 3) ?? [];
  const rest = data?.leaders?.slice(3) ?? [];

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="header">
          <div className="brand">
            <img
              src={LOGO_URL}
              alt="Campaign logo"
              className="logo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="brand-copy">
              <div className="eyebrow">THE KNOCKBOARD</div>
              <h1>Knock doors. Climb ranks.</h1>
            </div>
          </div>

          <button className="refresh-button" onClick={loadLeaderboard} aria-label="Refresh leaderboard">
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </button>
        </header>

        {loading && (
          <main className="loading-state">
            <div className="loading-card">
              <div className="loading-kicker">Pulling lists...</div>
              <div className="loading-title">Making sure everything is just right!</div>
              <div className="loading-bar">
                <div className="loading-bar-fill" />
              </div>
            </div>
          </main>
        )}

        {!loading && !data && (
          <main className="empty-state-wrap">
            <div className="empty-state-card">
              <div className="section-title">
                <Target size={18} />
                <span>Leaderboard not connected yet</span>
              </div>
              <p className="empty-copy">
                {error || "We could not load campaign data yet."}
              </p>
              <button className="retry-button" onClick={loadLeaderboard}>
                Try again
              </button>
            </div>
          </main>
        )}

        {!loading && data && (
          <main className="main-grid">
            <section className="left-column">
              <div className="panel">
                <div className="section-title">
                  <Trophy size={18} />
                  <span>Top 3 canvassers</span>
                </div>

                <div className="top-three-grid">
                  {topThree.map((person, index) => (
                    <article className={`winner-card winner-${index + 1}`} key={person.name}>
                      <div className="winner-rank">{ordinal(index + 1)} place</div>
                      <div className="winner-name">{person.name}</div>
                      <div className="winner-doors">
                        {person.doors}
                        <span>doors</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="section-title">
                  <TrendingUp size={18} />
                  <span>Full rankings</span>
                </div>

                <div className="rankings-list">
                  {rest.map((person, index) => {
                    const rank = index + 4;
                    return (
                      <div className="rank-row" key={person.name}>
                        <div className="rank-left">
                          <div className="rank-number">#{rank}</div>
                          <div>
                            <div className="rank-name">{person.name}</div>
                            <div className="rank-meta">Cumulative total</div>
                          </div>
                        </div>

                        <div className="rank-right">
                          <div className="rank-doors">{person.doors}</div>
                          <div className="rank-meta">doors</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="right-column">
              <div className="goal-card">
                <div className="goal-top">
                  <div>
                    <div className="week-label">{data.weekLabel}</div>
                    <div className="big-number">{data.totalDoors.toLocaleString()}</div>
                    <div className="goal-description">doors knocked campaign-wide</div>
                  </div>

                  <div className="updated-pill">
                    <div className="updated-line">
                      <CalendarDays size={14} />
                      <span>Updated</span>
                    </div>
                    <div>{formatUpdatedAt(data.updatedAt)}</div>
                  </div>
                </div>

                <div className="goal-stats">
                  <div className="stat-box">
                    <div className="stat-label">Goal</div>
                    <div className="stat-number">{data.goal.toLocaleString()}</div>
                    <div className="stat-subtext">by May 1</div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-label">Remaining</div>
                    <div className="stat-number">{remainingDoors.toLocaleString()}</div>
                    <div className="stat-subtext">doors left to win</div>
                  </div>
                </div>

                <div className="progress-card">
                  <div className="progress-header">
                    <div className="progress-title">
                      <Target size={16} />
                      <span>Campaign progress</span>
                    </div>
                    <div className="progress-percent">{progress}%</div>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="progress-copy">
                    {data.totalDoors.toLocaleString()} of {data.goal.toLocaleString()} doors knocked
                  </div>
                </div>
              </div>

              <a
                className="signup-card"
                href={SIGNUP_URL}
                target="_blank"
                rel="noreferrer"
              >
                <div className="signup-kicker">Help us crush the goal</div>
                <div className="signup-link">
                  Sign Up!
                  <ArrowRight size={16} />
                </div>
              </a>

              <div className="legal">
                <div>Only first name and last initial are shown. Full canvass data remains private.</div>
                <div>Authorized and paid for by Dalton Gau for State House 2026.</div>
              </div>
            </aside>
          </main>
        )}
      </div>
    </div>
  );
}
