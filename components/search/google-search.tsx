"use client";

import { useEffect, useId } from "react";
import { googleSearchEnabled, googleSearchEngineId } from "@/lib/config";

type GoogleSearchWindow = Window & {
  google?: {
    search?: {
      cse?: unknown;
    };
  };
};

export function GoogleSearch() {
  const containerId = useId();

  useEffect(() => {
    if (!googleSearchEnabled || !googleSearchEngineId) {
      return;
    }

    const gcse = document.createElement("script");
    gcse.type = "text/javascript";
    gcse.async = true;
    gcse.src = `https://cse.google.com/cse.js?cx=${googleSearchEngineId}`;
    document.head.appendChild(gcse);

    const init = () => {
      const googleWindow = window as GoogleSearchWindow;
      if (googleWindow.google && googleWindow.google.search && googleWindow.google.search.cse) {
        const target = document.getElementById(containerId);
        if (target) {
          target.innerHTML = '<div class="gcse-search"></div>';
        }
      }
    };

    gcse.onload = init;
    if ((window as GoogleSearchWindow).google?.search?.cse) {
      init();
    }

    return () => {
      gcse.remove();
      const existing = document.getElementById(containerId);
      if (existing) {
        existing.innerHTML = "";
      }
    };
  }, [containerId]);

  if (!googleSearchEnabled || !googleSearchEngineId) {
    return null;
  }

  return (
    <div className="w-full">
      <div id={containerId} className="min-h-[120px] w-full" />
    </div>
  );
}
