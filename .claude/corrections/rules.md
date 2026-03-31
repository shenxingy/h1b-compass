# Correction Rules — H1B Compass

---

- [2026-03-31] console-error-attribution (third-party-vs-own-code): When a console error stack frame points to our component file (e.g., `slider.tsx:48`) but our code at that location contains no problematic pattern (no script tags, no innerHTML, etc.), the bug is in the third-party library we call — not in our usage. Investigate the library's source, not our wrapper. Example: Base UI `SliderPrimitive.Thumb` internally uses innerHTML for a script tag, triggering React 19's "Encountered a script tag" warning at our JSX call site.

---

_End of corrections_
