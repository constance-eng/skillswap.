import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Coins, User, Settings, LogOut, Calendar, Wallet, Award } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./Logo";

export function AppHeader() {
  const { idToken, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const isLoggedIn = Boolean(idToken);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setAvatarOpen(false);
  }

  return (
    <header className="border-b border-rule bg-paper">
      <div className="flex items-center justify-between max-w-5xl px-6 py-5 mx-auto">
        <Link to={isLoggedIn ? "/dashboard" : "/"}>
          <Logo />
        </Link>

        <nav className="items-center hidden text-sm font-medium gap-7 md:flex text-ink-secondary">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="transition-colors hover:text-navy">Dashboard</Link>
              <Link to="/browse" className="transition-colors hover:text-navy">Browse</Link>
              <Link to="/matches" className="transition-colors hover:text-navy">Matches</Link>
            </>
          ) : (
            <>
              <Link to="/how-it-works" className="transition-colors hover:text-navy">How it works</Link>
              <Link to="/browse" className="transition-colors hover:text-navy">Browse</Link>
            </>
          )}
        </nav>

        <div className="items-center hidden gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 border border-cocoa text-ink-primary text-sm font-bold rounded-pill px-3.5 py-1.5 tabular hover:bg-apricot-light transition-colors"
              >
                <Coins size={15} aria-hidden="true" />
                {profile?.creditBalance ?? "-"}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center justify-center transition-opacity rounded-full w-9 h-9 bg-navy text-paper hover:opacity-90"
                  aria-label="Account menu"
                  aria-expanded={avatarOpen}
                >
                  <User size={17} aria-hidden="true" />
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 z-40 py-2 mt-2 overflow-hidden text-sm w-52 bg-navy rounded-card shadow-lift">
                    <Link
                      to="/profile"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-paper hover:bg-navy-light transition-colors"
                    >
                      <User size={15} aria-hidden="true" /> Profile
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-paper hover:bg-navy-light transition-colors"
                    >
                      <Calendar size={15} aria-hidden="true" /> Bookings
                    </Link>
                    <Link
                      to="/wallet"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-paper hover:bg-navy-light transition-colors"
                    >
                      <Wallet size={15} aria-hidden="true" /> Wallet
                    </Link>
                    <Link
                      to="/certificates"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-paper hover:bg-navy-light transition-colors"
                    >
                      <Award size={15} aria-hidden="true" /> Certificates
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-paper hover:bg-navy-light transition-colors"
                    >
                      <Settings size={15} aria-hidden="true" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full gap-2.5 px-4 py-2.5 mt-1 border-t border-navy-light text-apricot hover:bg-navy-light transition-colors"
                    >
                      <LogOut size={15} aria-hidden="true" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium transition-colors text-ink-secondary hover:text-navy"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold transition-shadow bg-navy text-paper rounded-pill hover:shadow-lift"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-ink-primary"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink-primary/60 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 flex flex-col h-full p-6 overflow-y-auto w-72 bg-navy shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <Logo onDark />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-paper"
                aria-label="Close menu"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 text-sm text-ink-onlight">
              {isLoggedIn ? (
                <>
                  {profile && (
                    <div className="flex items-center gap-1.5 border border-navy-soft text-paper font-bold rounded-pill px-3.5 py-1.5 w-fit mb-5 tabular">
                      <Coins size={15} aria-hidden="true" />
                      {profile.creditBalance}
                    </div>
                  )}
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Dashboard</Link>
                  <Link to="/browse" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Browse</Link>
                  <Link to="/matches" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Matches</Link>
                  <Link to="/bookings" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Bookings</Link>
                  <Link to="/wallet" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Wallet</Link>
                  <Link to="/certificates" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Certificates</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Profile</Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Settings</Link>
                  <button
                    onClick={handleLogout}
                    className="py-2.5 pt-4 mt-4 text-left border-t border-navy-light text-apricot"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/how-it-works" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">How it works</Link>
                  <Link to="/browse" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Browse</Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-apricot transition-colors">Log in</Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="mt-3 text-center bg-apricot text-navy font-bold rounded-pill px-4 py-2.5"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}