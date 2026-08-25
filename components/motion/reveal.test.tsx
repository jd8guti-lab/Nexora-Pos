import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./reveal";

type Stub = {
  cb: IntersectionObserverCallback;
  observed: Element[];
  disconnected: boolean;
};

/** Captures the observer so a test can drive the intersection by hand. */
function stubObserver() {
  const instances: Stub[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observed: Element[] = [];
      disconnected = false;
      constructor(public cb: IntersectionObserverCallback) {
        instances.push(this as unknown as Stub);
      }
      observe(el: Element) {
        this.observed.push(el);
      }
      unobserve() {}
      disconnect() {
        this.disconnected = true;
      }
      takeRecords() {
        return [];
      }
    },
  );
  return instances;
}

/** jsdom gives every element a zero rect, which reads as off-screen. */
function placeOffScreen() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top: 5000,
    bottom: 5200,
  } as DOMRect);
}

function placeOnScreen() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top: 100,
    bottom: 300,
  } as DOMRect);
}

/** Only `isIntersecting` is read; the rest is geometry we do not simulate. */
const entry = (target: Element, isIntersecting: boolean) =>
  ({ target, isIntersecting }) as unknown as IntersectionObserverEntry;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Reveal", () => {
  it("never hides anything when there is no IntersectionObserver", () => {
    // The whole no-JavaScript guarantee in one assertion: an element is only
    // ever hidden by the same code path that has committed to revealing it.
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <Reveal>
        <p>Inventario</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Inventario").parentElement!;
    expect(wrapper).toHaveAttribute("data-reveal");
    expect(wrapper).not.toHaveAttribute("data-reveal-armed");
  });

  it("arms itself and then reveals, never arming without observing", () => {
    const observers = stubObserver();
    placeOffScreen();
    render(
      <Reveal>
        <p>Crecimiento</p>
      </Reveal>,
    );

    const wrapper = screen.getByText("Crecimiento").parentElement!;
    expect(wrapper).toHaveAttribute("data-reveal-armed");
    expect(wrapper).not.toHaveAttribute("data-revealed");

    const observer = observers[0]!;
    expect(observer.observed).toContain(wrapper);

    observer.cb([entry(wrapper, true)], observer as unknown as IntersectionObserver);

    expect(wrapper).toHaveAttribute("data-revealed");
    // It fires once and never replays.
    expect(observer.disconnected).toBe(true);
  });

  it("reveals on-screen content immediately, without waiting for the observer", () => {
    // An observer in a page that is not compositing never fires. Anything
    // already visible must not depend on it.
    const observers = stubObserver();
    placeOnScreen();
    render(
      <Reveal>
        <p>Punto de venta</p>
      </Reveal>,
    );

    const wrapper = screen.getByText("Punto de venta").parentElement!;
    expect(wrapper).toHaveAttribute("data-revealed");
    expect(observers[0]?.observed ?? []).toHaveLength(0);
  });

  it("stays hidden while it is genuinely out of view", () => {
    const observers = stubObserver();
    placeOffScreen();
    render(
      <Reveal>
        <p>Personalización</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Personalización").parentElement!;
    const observer = observers[0]!;

    observer.cb([entry(wrapper, false)], observer as unknown as IntersectionObserver);

    expect(wrapper).not.toHaveAttribute("data-revealed");
  });

  it("falls back to a scroll check if the observer never fires", () => {
    stubObserver();
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 5000, bottom: 5200 } as DOMRect);

    render(
      <Reveal>
        <p>Contabilidad</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Contabilidad").parentElement!;
    expect(wrapper).not.toHaveAttribute("data-revealed");

    rect.mockReturnValue({ top: 100, bottom: 300 } as DOMRect);
    window.dispatchEvent(new Event("scroll"));

    expect(wrapper).toHaveAttribute("data-revealed");
  });

  it("keeps the requested tag, so lists stay lists", () => {
    stubObserver();
    placeOffScreen();
    render(
      <ul>
        <Reveal as="li">
          <span>Proveedores</span>
        </Reveal>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("staggers with an animation delay rather than a timer", () => {
    stubObserver();
    placeOffScreen();
    render(
      <Reveal delay={0.12}>
        <p>Reportes</p>
      </Reveal>,
    );
    expect(screen.getByText("Reportes").parentElement!.style.animationDelay).toBe(
      "0.12s",
    );
  });
});
