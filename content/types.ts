import type { LucideIcon } from "lucide-react";

/**
 * Shapes for everything under content/.
 *
 * Rule from CLAUDE.md §5: no component carries hardcoded copy. Changing a
 * sentence must never mean touching JSX.
 */

export type NavLink = {
  readonly label: string;
  readonly href: string;
  /** Set when the link leaves the marketing site. */
  readonly external?: boolean;
};

export type FooterColumn = {
  readonly title: string;
  readonly links: readonly NavLink[];
};

export type ContactChannel = {
  readonly kind: "whatsapp" | "email" | "city";
  readonly label: string;
  /** Display value. */
  readonly value: string;
  /** tel:/mailto:/https: target, or null when the value is not actionable. */
  readonly href: string | null;
};

export type TrustMetric = {
  readonly value: string;
  readonly label: string;
};

/** One of the six brand pillars. The set is fixed by the manual. */
export type Pillar = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
};

/** One of the seven modules. The set is fixed by the manual. */
export type Module = {
  readonly id: string;
  readonly name: string;
  /** One line, for the home grid. */
  readonly summary: string;
  /** Full paragraph, for /modulos. */
  readonly description: string;
  readonly bullets: readonly string[];
  readonly icon: LucideIcon;
};

export type ProcessStep = {
  readonly step: number;
  readonly title: string;
  readonly description: string;
};

export type UseCase = {
  readonly id: string;
  readonly business: string;
  /** The concrete pain, in the owner's own words. */
  readonly pain: string;
  readonly outcome: string;
  /** Module ids this business leans on. */
  readonly modules: readonly string[];
  readonly icon: LucideIcon;
};

export type PricingPlan = {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  /** Display string, e.g. "$ 180.000" or "Hablemos". */
  readonly price: string;
  readonly priceNote: string;
  readonly features: readonly string[];
  readonly cta: { readonly label: string; readonly href: string };
  readonly featured: boolean;
};

/** One row of the plan comparison table. */
export type PricingFeatureRow = {
  readonly feature: string;
  /** Keyed by plan id. `true`/`false`, or a short string like "Hasta 2". */
  readonly values: Readonly<Record<string, boolean | string>>;
};

export type FaqItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

/** A section's standing copy: label, title and optional standfirst. */
export type SectionIntro = {
  readonly eyebrow: string;
  readonly title: string;
  /**
   * The tail of the title, set in the brand orange.
   *
   * Split here and not in the component: which half of a sentence carries the
   * emphasis is a decision about the copy, and a component slicing on the
   * first full stop would put it somewhere else the day the sentence changes.
   */
  readonly titleAccent?: string;
  readonly lead?: string;
};

/**
 * One line of a comparison column. The sentence is split because the art sets
 * its opening in bold — the emphasis is part of the copy, so it is decided
 * here and not by a component slicing the string (CLAUDE.md §5).
 */
export type ComparisonPoint = {
  /** The opening words, set in bold. */
  readonly emphasis: string;
  /** The rest of the sentence. */
  readonly rest: string;
};

/** One side of the "plantilla única vs a medida" comparison. */
export type ComparisonColumn = {
  readonly title: string;
  /** One line under the title, naming who adapts to whom. */
  readonly subtitle: string;
  readonly points: readonly ComparisonPoint[];
};

export type LegalDocument = {
  readonly title: string;
  readonly updatedAt: string;
  readonly intro: string;
  readonly sections: readonly {
    readonly heading: string;
    readonly body: readonly string[];
  }[];
};
