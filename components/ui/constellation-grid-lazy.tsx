"use client";

import dynamic from "next/dynamic";

/**
 * The constellation mesh, kept out of the first load.
 *
 * Measured: importing it directly took the home from 111 kB to 122 kB of
 * First Load JS, past the ~120 kB ceiling in CLAUDE.md §6. It is decoration,
 * it is below the fold, and it is a canvas that cannot render on the server
 * anyway — so it is imported on the client, after hydration, and the page is
 * complete and readable without it.
 *
 * `ssr: false` is not an optimisation here, it is a requirement: the component
 * measures its parent and reads `devicePixelRatio` on mount.
 */
const ConstellationGrid = dynamic(
  () => import("./constellation-grid").then((m) => m.ConstellationGrid),
  { ssr: false },
);

export function ConstellationGridLazy() {
  return <ConstellationGrid />;
}
