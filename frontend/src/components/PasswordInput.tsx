import { Eye, EyeOff } from "lucide-react";
import { useState, type ChangeEvent } from "react";

interface Props {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  id?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  required = true,
  minLength,
  autoComplete,
  id,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-lg border border-slate-300 px-3 pr-11 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-blue-100"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
