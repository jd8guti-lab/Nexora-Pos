import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./reveal";
import { RevealObserver } from "./reveal-observer";

type Stub = { cb: IntersectionObserverCallback; observed: Element[] };

const observers: Stub[] = [];

function stubObserver() {
  observers.length = 0;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observed: Element[] = [];
      constructor(public cb: IntersectionObserverCallback) {
        observers.push(this as unknown as Stub);
      }
      observe(el: Element) {
        this.observed.push(el);
      }
      unobserve(el: Element) {
        this.observed = this.observed.filter((o) => o !== el);
      }
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
}

/** Runs the pending animation frame, where the fallback sweep sits. */
async function flushFrame() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

function placeAt(top: number, bottom: number) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    bottom,
  } as DOMRect);
}

const entry = (target: Element, isIntersecting: boolean) =>
  ({ target, isIntersecting }) as unknown as IntersectionObserverEntry;

function Page({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Reveal key={i} delay={i * 0.06}>
          <p>Bloque {i}</p>
        </Reveal>
      ))}
      <RevealObserver />
    </>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Reveal", () => {
  it("renders plain markup, with no client behaviour of its own", () => {
    // It is a server component: a tag, a data attribute and a delay.
    render(
      <Reveal delay={0.12}>
        <p>Clientes</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Clientes").parentElement!;
    expect(wrapper).toHaveAttribute("data-reveal");
    expect(wrapper).not.toHaveAttribute("data-reveal-armed");
    expect(wrapper.style.animationDelay).toBe("0.12s");
  });

  it("keeps the requested tag, so lists stay lists", () => {
    render(
      <ul>
        <Reveal as="li">
          <span>Proveedores</span>
        </Reveal>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });
});

describe("RevealObserver", () => {
  it("arms every block and watches them with one observer", async () => {
    stubObserver();
    placeAt(5000, 5200);
    const { container } = render(<Page count={3} />);

    const blocks = Array.from(container.querySelectorAll("[data-reveal]"));
    expect(blocks).toHaveLength(3);
    expect(blocks.every((b) => b.hasAttribute("data-reveal-armed"))).toBe(true);

    // One observer for the page, not one per block.
    expect(observers).toHaveLength(1);
    expect(observers[0]!.observed).toHaveLength(3);
  });

  it("hides nothing when there is no IntersectionObserver", () => {
    // The no-JavaScript guarantee: hiding and observing happen in the same
    // pass, so if the observer cannot exist, nothing is ever hidden.
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<Page count={2} />);
    const blocks = Array.from(container.querySelectorAll("[data-reveal]"));
    expect(blocks.every((b) => !b.hasAttribute("data-reveal-armed"))).toBe(true);
  });

  it("reveals a block when it intersects", async () => {
    stubObserver();
    placeAt(5000, 5200);
    const { container } = render(<Page count={3} />);
    const first = container.querySelector("[data-reveal]")!;

    await act(async () => {
      observers[0]!.cb(
        [entry(first, true)],
        observers[0] as unknown as IntersectionObserver,
      );
    });

    expect(first).toHaveAttribute("data-revealed");
  });

  it("does not measure anything while hydrating", () => {
    // getBoundingClientRect during mount forces a synchronous layout; fifteen
    // of those cost 1.3s of Style & Layout in Lighthouse.
    stubObserver();
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 5000, bottom: 5200 } as DOMRect);

    render(<Page count={3} />);

    expect(rect).not.toHaveBeenCalled();
  });

  it("reveals on-screen blocks on the next frame if the observer stays quiet", async () => {
    // An observer in a document that is not compositing never fires, and a
    // blank page is not an acceptable failure mode.
    stubObserver();
    placeAt(100, 300);
    const { container } = render(<Page count={2} />);

    await flushFrame();

    const blocks = Array.from(container.querySelectorAll("[data-reveal]"));
    expect(blocks.every((b) => b.hasAttribute("data-revealed"))).toBe(true);
  });

  it("leaves genuinely off-screen blocks hidden", async () => {
    stubObserver();
    placeAt(5000, 5200);
    const { container } = render(<Page count={2} />);

    await flushFrame();

    const blocks = Array.from(container.querySelectorAll("[data-reveal]"));
    expect(blocks.some((b) => b.hasAttribute("data-revealed"))).toBe(false);
  });

  it("falls back to a scroll sweep if the observer never fires", async () => {
    stubObserver();
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 5000, bottom: 5200 } as DOMRect);
    const { container } = render(<Page count={2} />);
    await flushFrame();

    rect.mockReturnValue({ top: 100, bottom: 300 } as DOMRect);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    const blocks = Array.from(container.querySelectorAll("[data-reveal]"));
    expect(blocks.every((b) => b.hasAttribute("data-revealed"))).toBe(true);
  });
});
