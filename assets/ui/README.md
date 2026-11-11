# Lobby texture sources

These PNGs are direct crops from the user-provided original lobby screenshot,
`Screenshot 2026-11-10 153512.png` (2727 × 1537 pixels).
Coordinates below are source pixels: x, y, width, height.

| Asset | Source rectangle | Usage |
| --- | --- | --- |
| panel-frame.png | 174, 24, 931, 1165 | CSS border-image; 44-pixel slices, no center fill |
| stone-tile.png | 2220, 785, 210, 95 | Empty stone surface, tiled under controls |
| button-face.png | 1740, 1070, 130, 28 | Empty button surface |
| button-frame.png | 1682, 1050, 811, 72 | CSS border-image; 12-pixel slices, no center fill |
| side-carving.png | 18, 24, 134, 1485 | Outer left/right decorative rails |
| blue-ornament.png | 1255, 996, 220, 207 | Center display ornament |
| center-panel.png | 1115, 20, 500, 1185 | Complete original center frame, Diablo title, and static Barbarian artwork; the nameplate text is covered by the live character name |

Frame centers contain the source interface and must never be rendered with
`border-image-slice: fill`. Only the empty surface crops repeat as backgrounds.
All texture styles are scoped to `.screen` so the screenshot-based shop scene
is unaffected. Include this directory when publishing the site.
