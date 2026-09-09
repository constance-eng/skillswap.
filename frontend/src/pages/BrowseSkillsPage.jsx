import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { apiRequest } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { TeacherCard } from "../components/TeacherCard";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

const CATEGORIES = ["all", "programming", "music", "language", "design", "general"];

export function BrowseSkillsPage() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const { data: skills, error, loading, reload } = useFetch(async () => {
    const query = category === "all" ? "" : `?category=${category}`;
    return (await apiRequest(`/skills${query}`)).skills;
  }, [category]);

  const visibleSkills = skills?.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl px-6 py-8 mx-auto">
      <h1 className="mb-2 text-2xl font-semibold text-ink-primary">Browse skills</h1>
      <p className="mb-6 text-sm text-ink-secondary">
        Find someone teaching what you want to learn
      </p>

      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute -translate-y-1/2 left-3 top-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <label htmlFor="search" className="sr-only">Search skills</label>
        <input
          id="search"
          type="text"
          placeholder="Search by skill or keyword"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-3 pl-10 pr-4 border outline-none bg-bg-panel text-ink-primary placeholder:text-ink-muted rounded-xl border-accent-soft focus-visible:border-accent-dark"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-sm px-4 py-2 rounded-pill transition-colors ${
              category === c
                ? "bg-accent text-accent-dark"
                : "bg-bg-panel border border-accent-soft text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-48" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && visibleSkills?.length === 0 && (
        <EmptyState
          icon={Search}
          title="No skills match your search"
          subtitle="Try a different keyword or category"
        />
      )}

      {!loading && !error && visibleSkills?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {visibleSkills.map((skill) => (
            <TeacherCard key={skill.skillId} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
