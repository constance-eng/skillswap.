import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ id, value, onChange, placeholder, required, hint, autoFocus }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="relative">
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoFocus={autoFocus}
          className="field pr-11"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-ink-muted hover:text-navy"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <p className="text-xs text-ink-muted mt-1.5 ml-1">{hint}</p>}
    </div>
  );
}