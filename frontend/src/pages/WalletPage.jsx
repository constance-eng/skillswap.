import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

function TransactionRow({ tx }) {
  const isSpend = tx.type === "SPEND";
  const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between py-3 border-b border-accent-soft last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-soft">
          {isSpend ? (
            <ArrowUpRight size={16} className="text-accent-dark" aria-hidden="true" />
          ) : (
            <ArrowDownLeft size={16} className="text-accent-dark" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink-primary">
            {isSpend ? "Session requested" : "Credits received"}
          </p>
          <p className="text-xs text-ink-muted">{date}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-ink-primary">
        {isSpend ? "-" : "+"}{tx.amount}
      </p>
    </div>
  );
}

export function WalletPage() {
  const { idToken, profile } = useAuth();
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadTransactions() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/transactions/me", { token: idToken });
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [idToken]);

  return (
    <div className="max-w-2xl px-6 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-ink-primary">Wallet</h1>

      <div className="p-6 mb-6 text-center border bg-bg-panel rounded-card border-accent-soft">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-accent-soft">
          <Coins size={22} className="text-accent-dark" aria-hidden="true" />
        </div>
        <p className="text-3xl font-semibold text-ink-primary">
          {profile?.creditBalance ?? "..."}
        </p>
        <p className="text-sm text-ink-secondary">credits available</p>
      </div>

      <div className="p-5 mb-6 border bg-bg-panel rounded-card border-accent-soft">
        <p className="text-sm text-ink-secondary">
          Start with 20 credits. Every session you request costs 10 credits.
          Teaching earns you credits back.
        </p>
      </div>

      <h2 className="mb-4 text-lg font-medium text-ink-primary">Transaction history</h2>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={loadTransactions} />}

      {!loading && !error && transactions?.length === 0 && (
        <EmptyState
          icon={Coins}
          title="No transactions yet"
          subtitle="Once you book a session, it'll show up here"
        />
      )}

      {!loading && !error && transactions?.length > 0 && (
        <div className="p-5 border bg-bg-panel rounded-card border-accent-soft">
          {transactions.map((tx) => (
            <TransactionRow key={tx.transactionId} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}