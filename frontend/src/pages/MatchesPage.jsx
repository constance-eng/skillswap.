import { useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { TeacherCard } from "../components/TeacherCard";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

export function MatchesPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { idToken } = useAuth();

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/match", {
        method: "POST",
        token: idToken,
        body: { query },
      });
      setMatches(data.matches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl px-6 py-8 mx-auto">
      <h1 className="mb-2 text-2xl font-display text-ink-primary">Matches</h1>
      <p className="mb-6 text-sm text-ink-secondary">
        People whose skills match what you want to learn
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute -translate-y-1/2 left-3 top-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <label htmlFor="matchQuery" className="sr-only">What do you want to learn?</label>
          <input
            id="matchQuery"
            type="text"
            placeholder="What do you want to learn?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-48" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={handleSearch} />}

      {!loading && !error && matches === null && (
        <EmptyState
          icon={Search}
          title="Search to find your matches"
          subtitle="Tell us what you want to learn and we'll find teachers for you"
        />
      )}

      {!loading && !error && matches?.length === 0 && (
        <EmptyState
          icon={Search}
          title="No matches yet"
          subtitle="Try a different phrase, or check back once more skills are posted"
        />
      )}

      {!loading && !error && matches?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {matches.map((skill) => (
            <TeacherCard key={skill.skillId} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}