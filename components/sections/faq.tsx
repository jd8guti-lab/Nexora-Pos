import { Section } from "@/components/layout/section";
import { Disclosure } from "@/components/ui/disclosure";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { faq, faqIntro } from "@/content/faq";

/**
 * The FAQ.
 *
 * Native <details>, so the answers are readable with no JavaScript at all —
 * and one shared `name` gives exclusive open without a line of script.
 *
 * The questions are the ones people actually ask before buying a POS in
 * Colombia, including the awkward ones about owning your data and leaving.
 *
 * Several answers still carry a visible TODO(guti): they are hard product
 * facts nobody but the owner can confirm. They render as written, on purpose.
 */
export function Faq() {
  return (
    <Section bg="paper" id="faq">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>{faqIntro.eyebrow}</Eyebrow>
          <Heading as="h2" className="mt-4">
            {faqIntro.title}
          </Heading>
        </div>

        {/* One shared `name` makes the browser close the others when one
            opens — an exclusive accordion, with no script. */}
        <div className="border-ink-500/20 border-t">
          {faq.map((item) => (
            <Disclosure key={item.id} name="faq" summary={item.question}>
              {item.answer}
            </Disclosure>
          ))}
        </div>
      </div>
    </Section>
  );
}
