# Elevation — Architecture & Construction Frame-Scroll Site
### Product & Engineering Spec (for Claude Code build)

**Idea & Concept by:** Swayam Parikh
**Project type:** Portfolio/agency-style marketing site with cinematic scroll-scrubbed video animation
**Purpose of this document:** Hand this file to Claude Code **along with the extracted frame sequence** (a folder of numbered JPG/PNG frames from the generated video, e.g. `frame_0001.jpg` to `frame_NNNN.jpg`) to build a full one-page site where the hero video plays frame-by-frame as the user scrolls, exactly like Apple product pages.

---

## 1. Concept Overview

**Site Name:** Elevation
**Tagline:** *"From foundation to skyline."*
**Category:** Architecture / Construction firm marketing site
**Core Mechanic:** A canvas-based hero section where scrolling the page scrubs through a pre-rendered video frame sequence (construction plot → completed building), giving the illusion of the building rising as the user scrolls down — no actual video playback, just canvas frame-swapping tied to scroll position (the standard technique used on Apple.com product pages).

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | |
| Styling | Tailwind CSS | Clean, premium architecture-studio aesthetic (Section 5) |
| Smooth Scroll | **Lenis** | Buttery smooth scroll, required for the frame-scrub effect to feel cinematic rather than janky |
| Scroll-Trigger Logic | **GSAP + ScrollTrigger** | Drives the canvas frame index based on scroll progress, plus section pin/reveal animations elsewhere on the page |
| Frame Rendering | HTML5 `<canvas>` + `drawImage()` | Frames pre-loaded into memory, current frame drawn based on scroll progress (0 → 1 maps to frame 1 → frame N) |
| Micro-interactions | Framer Motion | Text fade-ins, button hovers, nav transitions |
| Image Optimization | `next/image` for all non-canvas images (project gallery, team photos) | Canvas frames themselves should be pre-optimized/compressed JPGs before build (see Section 4) |
| Forms | Simple contact form → Resend (free tier) or a form service like Formspree (free tier) | |
| Hosting | Vercel | |

---

## 3. Page Structure (Header → Sections → Footer)

### 3.1 Header (sticky/fixed nav)
- Logo/wordmark (left) — "ELEVATION" in bold architectural type
- Nav links (right): Work · Studio · Services · Contact
- Nav background is transparent over the hero canvas, transitions to a solid/blurred background once scrolled past the hero section (common pattern on premium architecture sites)
- CTA button: "Start a Project" — distinct accent color, always visible

### 3.2 Hero — Frame-Scroll Canvas Section (the centerpiece)
- Full-viewport `<canvas>` element, pinned via `ScrollTrigger` (`pin: true`) for the duration of the scroll-scrub section (e.g. 300–400vh of scroll distance mapped to the full frame sequence)
- As user scrolls through this pinned section, canvas draws frames 1→N in sync with scroll progress — building visibly rises from foundation to complete
- Overlaid text at different scroll checkpoints (fades in/out at specific frame ranges):
  - Early frames: "Every skyline starts with a foundation."
  - Mid frames: "Structure. Precision. Vision."
  - Late frames: "Elevation — Architecture that rises to the occasion."
- Scroll-progress indicator (subtle line/dot on the side showing how far through the hero sequence the user is)
- Loading state: show a preloader (percentage or animated logo) while all frames download before allowing scroll — critical, since a half-loaded frame sequence looks broken

### 3.3 About/Studio Section
- Brief studio statement (2–3 sentences) with a scroll-triggered fade/slide-up reveal (Framer Motion)
- Key stats row (animated count-up on scroll into view): "150+ Projects Delivered," "12 Years," "40+ Awards," etc.

### 3.4 Services Section
- Grid or horizontal-scroll cards: Architectural Design, Construction Management, Interior Design, Urban Planning, Sustainability Consulting (adjust to real services)
- Each card: icon, title, short description, subtle hover-lift animation

### 3.5 Featured Projects / Portfolio
- Large project cards, full-width alternating layout (image left/text right, then reversed)
- Each project: hero image, project name, category, location, "View Project →" link
- Scroll-triggered parallax on project images (image moves slightly slower/faster than scroll for depth)
- Optional: clicking a project opens a detail page/modal with a full case study (gallery, project specs, timeline)

### 3.6 Process/Timeline Section
- Horizontal or vertical scroll-driven timeline: Concept → Design → Approval → Construction → Handover
- Each stage reveals with a scroll-triggered animation as it enters viewport — reinforces the "building rising" narrative from the hero, now applied to the actual project process

### 3.7 Testimonials
- Simple carousel or scroll-snap horizontal cards, client quotes + project reference

### 3.8 Contact/CTA Section
- Bold closing statement: "Ready to build what's next?"
- Contact form: Name, Email, Project Type, Budget Range, Message
- Alternative: direct email/phone display + office address with an embedded map

### 3.9 Footer
- Logo + short tagline
- Columns: Navigation links | Services list | Social links (Instagram, LinkedIn, Behance — architecture firms lean visual-platform-heavy) | Contact info (email, phone, address)
- Newsletter signup (optional): "Get updates on our latest builds"
- Bottom bar: Copyright, Privacy Policy, credit line ("Concept by Swayam Parikh")

---

## 4. Frame Sequence Implementation Notes (critical technical section)

**Preparing the frames (before handing to Claude Code):**
- Extract frames via FFmpeg at a reasonable rate — you don't need 30fps for every frame; **10–15 frames per second of source video** is usually enough for a smooth scroll-scrub effect while keeping file size manageable
- Resize/compress frames to a reasonable max width (e.g. 1600–1920px wide, JPG quality ~70–80%) — a 10-second video at 15fps is 150 frames; at full 4K each frame could be several MB, which will make the site painfully slow to load. Compressed, this should land in the 20–50KB range per frame.
- Name frames sequentially with zero-padding: `frame_0001.jpg`, `frame_0002.jpg`, ... `frame_0150.jpg` — Claude Code will build the loader around this exact naming pattern

**Implementation approach for Claude Code:**
1. Preload all frame images into memory on page load (show preloader with progress %)
2. Create a GSAP ScrollTrigger with a pinned trigger element spanning enough scroll distance (e.g. `end: '+=3000'`)
3. On scroll update, calculate `frameIndex = Math.round(scrollProgress * (totalFrames - 1))`
4. Draw the corresponding frame onto the canvas using `ctx.drawImage()`, sized/cropped via `object-fit: cover` logic to fill the viewport responsively
5. Debounce/throttle isn't needed since GSAP ScrollTrigger's `onUpdate` already syncs efficiently to the scroll/rAF cycle — but do cache all `Image()` objects up front rather than re-fetching per frame
6. Handle window resize by recalculating canvas dimensions and redrawing the current frame
7. Provide a graceful fallback for mobile (frame-scroll canvas techniques can be heavy on low-end mobile devices) — consider showing a simpler static hero image or a shorter/lower-res frame set on mobile viewports

---

## 5. UI/UX Theme — "Architectural Precision"

**Direction:** Premium, minimal, confident — like the buildings themselves. Lots of negative space, sharp typography, muted sophisticated palette that lets the golden-hour building imagery be the star.

- **Base:** Warm off-white `#F7F5F1` and deep charcoal `#161513` — alternating sections between light and dark creates rhythm and lets the hero's golden-hour tones pop
- **Primary accent:** Warm amber/gold `#C9A24B` — echoes the golden-hour lighting in the hero video, used sparingly for CTAs, underlines, key stat numbers
- **Typography:** A strong architectural serif or geometric sans for headings — e.g. `Fraunces` or `Söhne`/`Neue Montreal`-style geometric sans (use `Space Grotesk` as a free alternative) for a confident, editorial feel; `Inter` for body copy
- **Layout:** Generous whitespace, large type scale for headings (this is an industry where confident, editorial-magazine-style layout signals quality), asymmetric grid for project showcases rather than a rigid uniform grid
- **Motion:** Restrained and purposeful outside the hero — slow, smooth fades and slides (nothing bouncy/playful, this should feel engineered and precise, matching the subject matter)

---

## 6. Suggested Folder Structure

```
elevation/
├── app/
│   ├── page.tsx                  # single-page site assembling all sections
│   ├── projects/[slug]/          # individual project case study pages
│   └── layout.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroCanvas.tsx            # the frame-scroll canvas component
│   ├── sections/
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Projects.tsx
│   │   ├── Process.tsx
│   │   ├── Testimonials.tsx
│   │   └── Contact.tsx
│   └── ui/
├── lib/
│   ├── useFrameLoader.ts         # preloads frame images, tracks load progress
│   └── scrollAnimations.ts       # GSAP ScrollTrigger setups for non-hero sections
├── public/
│   └── frames/                   # frame_0001.jpg ... frame_NNNN.jpg goes here
└── package.json
```

---

## 7. Build Order (Recommended for Claude Code)

1. Scaffold Next.js + Tailwind, install GSAP, Lenis, Framer Motion
2. Build Header + Footer shells
3. Build `HeroCanvas` component: frame preloader with progress UI → canvas rendering → GSAP ScrollTrigger scroll-scrub logic (get this working with placeholder frames first, then drop in the real extracted frame sequence)
4. Build hero overlay text checkpoints synced to scroll progress
5. Build About/Stats section with count-up animations
6. Build Services grid
7. Build Projects showcase section with parallax image reveals
8. Build Process/Timeline scroll-reveal section
9. Build Testimonials + Contact + Footer
10. Mobile responsiveness pass — specifically test/optimize the canvas frame-scroll performance on mobile, add the lighter fallback if needed
11. Performance pass: verify frame preload doesn't block initial page paint (show the rest of the page loading behind/after the hero preloader), lazy-load below-the-fold images

---

## 8. Notes for Handoff
- Drop your extracted, compressed frame sequence into `public/frames/` following the `frame_0001.jpg` naming convention before running Claude Code, or tell Claude Code the exact folder path and naming pattern you used so `useFrameLoader.ts` is generated to match exactly.
- If the AI-generated video has any visually broken frames (common with architectural geometry), it's fine to manually delete/skip a few bad frames from the sequence — just make sure the remaining frames are renamed sequentially with no gaps, since the loader indexes them by count.

---

*End of spec — ready to hand to Claude Code, along with your frames folder.*
