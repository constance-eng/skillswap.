import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-accent-soft last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={open}
      >
        <span className="pr-4 font-medium text-ink-primary">{question}</span>
        <ChevronDown
          size={18}
          className={`text-ink-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <p className="pb-4 text-sm text-ink-secondary">{answer}</p>}
    </div>
  );
}