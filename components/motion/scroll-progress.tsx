/**
 * A thin orange line along the top of the window that fills as the page is read.
 *
 * A server component with no behaviour of its own: the browser drives it from the scroll, in
 * globals.css, so it costs no JavaScript. Where `animation-timeline` is not supported the line is
 * simply not there.
 */
export function ScrollProgress() {
  return <div aria-hidden="true" className="scroll-progress" />;
}
