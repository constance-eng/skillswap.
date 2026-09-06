import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-accent-soft">
      <div className="max-w-6xl px-6 pt-16 pb-10 mx-auto">
        <p
          className="mb-10 font-bold leading-none text-center select-none text-accent-soft"
          style={{ fontSize: "clamp(3rem, 15vw, 11rem)" }}
          aria-hidden="true"
        >
          SKILLSWAP
        </p>

        <div className="grid grid-cols-2 gap-8 pt-10 border-t md:grid-cols-4 border-accent-soft">
          <div>
            <Logo className="mb-3" />
            <p className="text-sm text-ink-secondary">
              Learn what you want, teach what you know.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs tracking-wider uppercase text-ink-muted">Product</p>
            <div className="flex flex-col gap-2 text-sm text-ink-secondary">
              <Link to="/how-it-works" className="hover:text-ink-primary">How it works</Link>
              <Link to="/browse" className="hover:text-ink-primary">Browse skills</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs tracking-wider uppercase text-ink-muted">Account</p>
            <div className="flex flex-col gap-2 text-sm text-ink-secondary">
              <Link to="/login" className="hover:text-ink-primary">Log in</Link>
              <Link to="/signup" className="hover:text-ink-primary">Sign up</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs tracking-wider uppercase text-ink-muted">Legal</p>
            <div className="flex flex-col gap-2 text-sm text-ink-muted">
              <span>Terms (coming soon)</span>
              <span>Privacy (coming soon)</span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-ink-muted">
          &copy; SkillSwap 2026
        </p>
      </div>
    </footer>
  );
}