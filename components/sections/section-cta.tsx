import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sectionCta } from "@/content/home";
import { cn } from "@/lib/utils";

/**
 * The booking call to action that closes every section of the home.
 *
 * It exists because the user asked to be able to book from anywhere on the
 * page instead of only at the end, and it is one component rather than three
 * copies so that the destination and the wording stay in step.
 *
 * It opens WhatsApp, which means it leaves the site: hence `target="_blank"`
 * with `rel="noreferrer"`. The line that used to sit beside it saying so was
 * dropped at the user's request — the copy is still in `content/home.ts` as
 * `sectionCta.note` if it ever comes back.
 */
export function SectionCta({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      <Button asChild size="lg">
        <Link href={sectionCta.href} target="_blank" rel="noreferrer">
          {sectionCta.label}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
