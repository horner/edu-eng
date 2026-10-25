import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider, ThemeProviderContext } from "@mieweb/ui";
import {
  defaultBrand,
  generateBrandCSS,
  type BrandConfig,
  type ColorScale,
} from "@mieweb/ui/brands";
import type { Brand } from "./data/types";
import { browserStorage } from "./state";

export function AppTheme({ children }: { children: ReactNode }) {
  const [persistent] = useState(() => Boolean(browserStorage()));
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    if (!persistent) {
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [persistent, theme]);
  if (persistent) return <ThemeProvider>{children}</ThemeProvider>;
  // The library's theme hook accesses storage directly. Its documented context
  // keeps library consumers usable when a browser rejects that access.
  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        resolvedTheme: theme,
        setTheme: (value) => setTheme(value === "dark" ? "dark" : "light"),
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

function blend(color: string, target: string, fraction: number): string {
  const a = color
    .replace("#", "")
    .match(/../g)!
    .map((v) => parseInt(v, 16));
  const b = target
    .replace("#", "")
    .match(/../g)!
    .map((v) => parseInt(v, 16));
  return `#${a
    .map((v, i) =>
      Math.round(v + (b[i] - v) * fraction)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function brandCSS(brand: Brand): string {
  const primary: Record<number, string> = {};
  for (const [level, fraction] of [
    [50, 0.96],
    [100, 0.91],
    [200, 0.78],
    [300, 0.6],
    [400, 0.3],
    [500, 0],
  ] as const)
    primary[level] = blend(brand.colors.primary, "#ffffff", fraction);
  for (const [level, fraction] of [
    [600, 0.17],
    [700, 0.3],
    [800, 0.43],
    [900, 0.58],
    [950, 0.76],
  ] as const)
    primary[level] = blend(brand.colors.primary, "#000000", fraction);
  const config: BrandConfig = {
    ...defaultBrand,
    name: brand.id,
    displayName: brand.name,
    colors: {
      ...defaultBrand.colors,
      primary: primary as unknown as ColorScale,
      accent: { DEFAULT: brand.colors.primary },
      light: {
        ...defaultBrand.colors.light,
        background: brand.colors.background,
        foreground: brand.colors.text,
        card: brand.colors.surface,
        cardForeground: brand.colors.text,
        mutedForeground: brand.colors.muted,
        border: brand.colors.border,
        input: brand.colors.border,
        ring: primary[800],
      },
      dark: {
        ...defaultBrand.colors.dark,
        background: "#151719",
        foreground: "#f5f4f0",
        card: "#1e2124",
        cardForeground: "#f5f4f0",
        muted: "#282d31",
        mutedForeground: "#b8bfc7",
        border: "#3f464c",
        input: "#59616a",
        ring: primary[300],
      },
    },
  };
  return generateBrandCSS(config);
}
