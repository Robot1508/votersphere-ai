"use client";

import { useEffect } from "react";

/**
 * DynamicViewport
 *
 * Manually injects the viewport meta tag to bypass Next.js 16.2.4 Turbopack
 * prerender bugs related to 'export const viewport'.
 */
export function DynamicViewport() {
  useEffect(() => {
    // Check if meta tag already exists
    let meta = document.querySelector('meta[name="viewport"]');
    
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      document.head.appendChild(meta);
    }
    
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    );
  }, []);

  return null;
}
