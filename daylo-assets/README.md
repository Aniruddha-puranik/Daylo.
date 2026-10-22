# Daylo asset pack

Free, original, hand-built. No stock, no licenses. Fonts are not bundled: load Fraunces (or Instrument Serif), Inter Tight (or Geist) and JetBrains Mono through `next/font`.

## Where to put things (Next.js, `UI/` app root)

| Pack folder | Copy to | Use |
|---|---|---|
| `icons/*` | `public/icons/` | PWA, favicon, Apple touch icon |
| `pwa/manifest.webmanifest` | `public/manifest.webmanifest` | link in `app/layout.tsx` via `metadata.manifest` |
| `og/og-image.png` | `public/og-image.png` | `metadata.openGraph.images` and `twitter.images` |
| `textures/paper-grain.svg` | `public/textures/` | referenced by `--grain` in tokens |
| `hand-drawn/*`, `decor/*`, `brand/*` | `public/art/` | inline them (see below) or `<img>` |
| `audio/*` | `public/audio/` | optional sounds, off by default |
| `css/daylo-tokens.css` | `app/` | `@import` at top of `globals.css` |

## Wire-up snippets

```tsx
// app/layout.tsx
export const metadata = {
  metadataBase: new URL("https://daylo-beige.vercel.app"),
  title: "Daylo — Make every day count",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icons/favicon.ico" }, { url: "/icons/daylo-mark.svg", type: "image/svg+xml" }], apple: "/icons/apple-touch-icon.png" },
  openGraph: { images: ["/og-image.png"] },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
};
export const viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#123524" }, { media: "(prefers-color-scheme: dark)", color: "#0b1f15" }], viewportFit: "cover" };
```

Body: `<body className="paper">` gives warm paper + grain.

## Asset notes

- **Hand-drawn SVGs** use `currentColor` or fixed brand colors, `pathLength="1"` so stroke-draw works at any size, and respect `prefers-reduced-motion`. `squiggle-underline`, `pen-tick`, `circle-today`, `arrow-curl` self-animate once when mounted. To replay, remount or toggle the `.draw` / `.in` classes from `daylo-tokens.css` on inline SVG.
- **Sprouts 1-4** = streak stages: 1-2 days, 3-6, 7-13, 14+ (bloom). Swap by habit streak.
- **stamp-done**: goal at 100%. Plays a 320ms press-in.
- **spark**: goal milestones 25/50/75%.
- **tape / paperclip**: decor for landing cards and notes. Rotate 1-2 degrees, never perfectly square.
- **Sounds** (22kHz mono WAV, tiny): `pen-tick` task check, `pop` add, `chime` focus complete, `reminder` hydration. Gate behind a Settings toggle, default off. Browsers require a user gesture before audio plays. Convert to `.m4a`/`.ogg` if you want smaller files.
- **Maskable icon** keeps the logo inside the safe zone so Android crops never clip it.
- **favicon.svg** flips colors in dark browser tabs.

## Not included (needs real photos or your own art)

Product screenshots for the landing page. Capture them from the live app at 390px and 1280px, in light and dark, with real (not fake) data, then add tape or tilt in CSS.

## Music

`music/daylo-calm-morning` (56s) and `music/daylo-deep-focus` (64s), mp3 + ogg, original synthesized ambient loops, seamless. Off by default, user gesture to play. See `DAYLO_ASSETS_PROMPT.md` for the player spec.

## Logo warning

The symbol, icons and favicon are hand-traced vector approximations of your real logo (cream D + gold sun + sage leaf on forest). Close, not pixel-exact. If you have the vector source, swap it into `brand/` and rerun the icon export. The OG image embeds the real lockup. Palette now follows the logo: cream, forest, sage, gold (no lime). See `DAYLO_ASSETS_PROMPT.md` section 1.
