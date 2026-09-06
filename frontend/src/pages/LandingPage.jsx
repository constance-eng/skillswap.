import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Sparkles, ArrowLeftRight } from "lucide-react";
import { Footer } from "../components/Footer";
import { FaqItem } from "../components/FaqItem";

const CATEGORIES = ["programming", "music", "language", "design", "general"];

const STEPS = [
  { icon: Plus, title: "List a skill you can teach", body: "Post anything you know well enough to walk someone else through." },
  { icon: Sparkles, title: "Get matched", body: "We rank teachers by how closely their skills fit what you want to learn." },
  { icon: ArrowLeftRight, title: "Swap credits to learn", body: "Every session costs 10 credits. Teaching earns them back." },
];

const FAQS = [
  { question: "What does it cost to join?", answer: "Nothing. You start with 20 credits when you sign up, which is enough for two sessions." },
  { question: "How do credits work?", answer: "Every session costs the learner 10 credits. Teaching earns credits back, so the more you teach, the more you can learn." },
  { question: "What happens if I run out of credits?", answer: "You'll need to teach something to earn more. Buying credits is planned but not built yet." },
  { question: "How are teachers matched to me?", answer: "You describe what you want to learn, and we compare it against every posted skill to rank the closest fits." },
  { question: "Are teachers verified?", answer: "Every account confirms their email at sign-up. Deeper verification and ratings are planned but not built yet." },
];

export function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query)}` : "/browse");
  }

  return (
    <div className="min-h-screen bg-paper">
      <section className="max-w-3xl px-6 pt-20 pb-16 mx-auto text-center">
        <h1 className="mb-4 text-4xl leading-tight font-display md:text-5xl text-ink-primary">
          Learn any skill.
          <br />
          Pay with what you already know.
        </h1>
        <p className="max-w-xl mx-auto mb-8 text-ink-secondary">
          Teach something you're good at, earn credits, and spend them learning
          from someone else. No subscriptions.
        </p>

        <form onSubmit={handleSearch} className="flex max-w-xl gap-2 mx-auto mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-ink-muted" aria-hidden="true" />
            <label htmlFor="landingSearch" className="sr-only">Search skills</label>
            <input
              id="landingSearch"
              type="text"
              placeholder="What do you want to learn?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 field"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to={`/browse?category=${c}`}
              className="text-sm text-ink-secondary border border-rule rounded-pill px-4 py-1.5 hover:text-navy hover:border-navy transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl px-6 py-16 mx-auto border-t border-rule">
        <p className="mb-10 text-center eyebrow text-ink-muted">How it works</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-apricot-light">
                <step.icon size={20} className="text-navy" aria-hidden="true" />
              </div>
              <p className="mb-1 font-medium text-ink-primary">
                {i + 1}. {step.title}
              </p>
              <p className="text-sm text-ink-secondary">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl px-6 py-16 mx-auto">
        <h2 className="mb-1 text-2xl font-display text-ink-primary">Frequently asked questions</h2>
        <p className="mb-8 text-sm text-ink-secondary">What to know before your first swap.</p>
        <div className="px-6 border bg-paper-bright rounded-card border-rule">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      <section className="max-w-2xl px-6 pb-8 mx-auto text-center">
        <h2 className="mb-3 text-2xl font-display text-ink-primary">Ready to swap?</h2>
        <p className="mb-6 text-sm text-ink-secondary">Sign up and get 20 credits to start learning.</p>
        <Link to="/signup" className="btn-primary">
          Get started
        </Link>
      </section>

      <Footer />
    </div>
  );
}