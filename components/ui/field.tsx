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
  inverse,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /**
   * For fields on an `ink-900` background, like the portal login.
   *
   * Without it the label keeps `text-ink-900` and becomes invisible on a dark surface — which is
   * exactly what happened the first time the login was rendered: the asterisk showed and the word
   * did not. `npm run contrast` did not catch it because it measures tokens, not compositions.
   */
  inverse?: boolean;
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
      <label
        htmlFor={id}
        className={cn("text-small font-semibold", inverse ? "text-white" : "text-ink-900")}
      >
        {label}
        {required ? (
          // brand-300 on ink-900 is 9.48:1; brand-700 on it would be too dark to read.
          <span className={inverse ? "text-brand-300" : "text-brand-700"} aria-hidden>
            {" *"}
          </span>
        ) : (
          <span className={cn("font-normal", inverse ? "text-paper-50/70" : "text-ink-500")}>
            {" "}
            (opcional)
          </span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className={cn("text-small", inverse ? "text-paper-50/70" : "text-ink-500")}>
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
        <p
          id={errorId}
          className={cn("text-small font-medium", inverse ? "text-brand-300" : "text-brand-700")}
        >
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
