import { useId } from "react";
import { cn } from "@/lib/utils";

const control = [
  "w-full rounded-xl border bg-white px-4 text-body text-ink-900",
  "placeholder:text-ink-500/70",
  "transition-colors duration-200 ease-brand",
  "disabled:opacity-60",
].join(" ");

/**
 * Field wraps a control with its label, hint and error, and wires the three
 * together — `htmlFor`, `aria-describedby` and `aria-invalid`. Doing it here
 * rather than at each call site is what stops an error message from being
 * visible but unannounced.
 *
 * It uses a render prop because the id has to reach the control itself, and
 * cloning children to inject props is the kind of magic that breaks quietly.
 */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
    className: string;
  }) => React.ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small text-ink-900 font-semibold">
        {label}
        {required ? (
          <span className="text-brand-700" aria-hidden>
            {" *"}
          </span>
        ) : (
          <span className="text-ink-500 font-normal"> (opcional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-small text-ink-500">
          {hint}
        </p>
      ) : null}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        className: cn(
          control,
          error
            ? "border-brand-700 focus-visible:outline-brand-700"
            : "border-ink-500/30 hover:border-ink-500/50",
        ),
      })}

      {error ? (
        <p id={errorId} className="text-small text-brand-700 font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.ComponentPropsWithoutRef<"input">) {
  // h-12, not h-11: an input is a touch target too.
  return <input className={cn("h-12", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn("min-h-32 resize-y py-3", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"select">) {
  return <select className={cn("h-12", className)} {...props} />;
}
