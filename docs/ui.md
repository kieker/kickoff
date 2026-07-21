# UI Notes

## Widget Icons

Status: **Active in beta**

Current approach:

- Platform widgets use brand icons from `react-icons/si`.
- Weather uses a generic weather icon because it represents a data category rather than a platform brand.
- Widget icon visibility can be controlled globally or per widget in the settings drawer.

Project files:

- `packages/dashboard/src/components/widget-shell.tsx`
- `packages/dashboard/src/components/settings-panel.tsx`
- `packages/dashboard/src/widgets/`

Phase-two idea:

- Add selectable icon styles, such as brand, monochrome, minimal, or no icons.
- Keep brand icons opt-in if the design later needs a quieter or less brand-heavy look.
- Expand and and shrink widgets by click and drag, also collapse

