import { ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../api/client";
import { useFetch } from "../hooks/useFetch";
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
    <div className="flex items-center justify-between py-3 border-b border-rule last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-apricot-light">
          {isSpend ? (
            <ArrowUpRight size={16} className="text-ink-onLight" aria-hidden="true" />
          ) : (
            <ArrowDownLeft size={16} className="text-ink-onLight" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink-primary">
            {isSpend ? "Session requested" : "Credits received"}
          </p>
          <p className="text-xs text-ink-muted">{date}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-ink-primary tabular">
        {isSpend ? "-" : "+"}{tx.amount}
      </p>
    </div>
  );
}

export function WalletPage() {
  const { idToken, profile } = useAuth();
  const { data: transactions, error, loading, reload } = useFetch(
    async () => (await apiRequest("/transactions/me", { token: idToken })).transactions,
    [idToken]
  );

  return (
    <div className="max-w-2xl px-6 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-display text-ink-primary">Wallet</h1>

      <div className="p-6 mb-6 text-center bg-navy rounded-card shadow-soft">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-navy-light">
          <Coins size={22} className="text-apricot" aria-hidden="true" />
        </div>
        <p className="text-3xl font-display text-ink-onDark tabular">
          {profile?.creditBalance ?? "..."}
        </p>
        <p className="text-sm text-ink-onDarkMuted">credits available</p>
      </div>

      <div className="p-5 mb-6 border bg-paper-bright rounded-card border-rule">
        <p className="text-sm text-ink-secondary">
          Start with 20 credits. Every session you request costs 10 credits.
          Teaching earns you credits back.
        </p>
      </div>

      <h2 className="mb-4 text-lg font-display text-ink-primary">Transaction history</h2>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && transactions?.length === 0 && (
        <EmptyState
          icon={Coins}
          title="No transactions yet"
          subtitle="Once you book a session, it'll show up here"
        />
      )}

      {!loading && !error && transactions?.length > 0 && (
        <div className="p-5 border bg-paper-bright rounded-card border-rule">
          {transactions.map((tx) => (
            <TransactionRow key={tx.transactionId} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
