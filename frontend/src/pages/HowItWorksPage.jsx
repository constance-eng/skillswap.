import { Link } from "react-router-dom";
import { Plus, Sparkles, Coins, ShieldCheck } from "lucide-react";
import { Footer } from "../components/Footer";

const SECTIONS = [
  {
    icon: Coins,
    title: "The credit economy",
    body: "Every new account starts with 20 credits. Booking a session with a teacher costs the learner a fixed 10 credits, no matter which skill it is. Teaching earns credits back, so the more you teach, the more you can afford to learn. If you only ever learn and never teach, you'll eventually run out and need to earn more by teaching something yourself.",
  },
  {
    icon: Sparkles,
    title: "How matching works",
    body: "When you search for something to learn, we compare your query against every posted skill's title and description, and rank teachers by how closely their skill matches what you typed. This happens instantly, using the actual words you use, not a fixed category list.",
  },
  {
    icon: ShieldCheck,
    title: "Trust and safety",
    body: "Every account confirms a real email address before it can log in. Beyond that, deeper verification, teacher badges, and ratings from completed sessions are planned but not built yet, so we don't display fake stars or badges anywhere on the platform.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <section className="max-w-2xl px-6 pt-16 pb-12 mx-auto text-center">
        <h1 className="mb-4 text-3xl font-semibold md:text-4xl text-ink-primary">
          How SkillSwap works
        </h1>
        <p className="text-ink-secondary">
          No subscriptions, no cash changing hands between members. Just skills, traded fairly.
        </p>
      </section>

      <section className="max-w-2xl px-6 pb-16 mx-auto space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex gap-4">
            <div className="flex items-center justify-center rounded-full shrink-0 w-11 h-11 bg-accent-soft">
              <section.icon size={20} className="text-accent" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-ink-primary mb-1.5">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-ink-secondary">
                {section.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-2xl px-6 pt-12 pb-16 mx-auto text-center border-t border-accent-soft">
        <h2 className="mb-2 text-xl font-semibold text-ink-primary">
          Ready to try it?
        </h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Sign up and start with 20 free credits.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 font-medium transition-opacity bg-accent text-bg-base rounded-pill hover:opacity-90"
        >
          <Plus size={16} aria-hidden="true" />
          Get started
        </Link>
      </section>

      <Footer />
    </div>
  );
}