# Mansub · منسوب

A small tool for measuring proportion in Arabic calligraphy.

Everything in the classical system is measured against one reference: the height
of the alif. Mansub asks you for that height once, builds a grid from it, and then
lets you set down circles and lines at exact fractions of it, or draw your own and
read them back as a fraction of the alif, with a score for how close the fit is.

**[shawetaylorec.github.io/mansub](https://shawetaylorec.github.io/mansub/)** opens
straight into the tool.

**One file, no install.** Download `index.html` and open it in a browser. Nothing is
uploaded anywhere; the image stays on your machine.

## Getting started

The app opens on a sample specimen with a prompt to bring your own: **Upload an
image**, paste one with `Ctrl+V` (`⌘V` on a Mac), or drag it anywhere onto the page.
**Try the sample first** closes the prompt and leaves the specimen to play with.

The steps along the top bar track where you are: open an image, straighten it,
measure the alif, then place and measure.

1. **Straighten.** If the page was shot askew, drag the dial beneath the image. A
   pixel of drag is 0.05°, and holding `Shift` makes it 0.005°; `[` and `]` nudge by a
   tenth of a degree. There is a detent at square, the readout turns gold once you are
   off it, and clicking the readout straightens back. `90°` handles a photograph that
   came in sideways.

   The alif and its grid stay put while the photograph turns under them, so you
   straighten until the script lines up rather than tilting the grid to chase it.
   Marks already placed turn with the page and stay on the letters they measure.

   **Crop** (on by default) trims the turned page back to the largest upright
   rectangle that still fits inside it. What falls outside is dimmed rather than
   hidden, so you can see what you are giving up.
2. **Measure the alif** (`A`). Drag from the top of an alif to its foot. The measure is
   locked to true vertical, so the grid always runs square to the image. A grid
   appears, cut into equal squares of that alif (8 by default, with 5 and 9 offered as
   the usual nuqta counts for naskh and thuluth). Heavier lines fall on whole alifs.
3. **Place and measure.** See below.
4. **Export PNG** writes the image, the grid and your marks out as one picture, at 1×
   to 4× the page's own pixels, showing the dimensions and file size before you save.

## Placing by ratio

Measuring answers *what is this?* Placing answers *where does a quarter of an alif
actually fall?* and it comes first in Mansub.

Choose **Circle** (`C`) or **Line** (`L`) on the left and a palette of ratios opens:
eighths through two alifs, or type any fraction. Pick one and the shape follows the
pointer until you click to set it down over a letter. The palette closes while you
place, so the whole sheet is clear, and the tool stays armed so you can keep placing;
`Esc` brings the palette back for another size. Lines can be **Vertical** (the default) or
**Horizontal**. Placed shapes are exact by construction, so their label reads 100%,
and they are tagged *Placed* in the list.

## Measuring freehand

The ruler (`M`) is for drawing your own line or circle over the script and reading
what it is. Press `M` again to switch between line and circle. Circles are drawn from
the centre outwards. `Shift` snaps a line to 15° steps. These are tagged *Measured*.

A label like `1/4 · 98%` means the shape is nearest to a quarter of an alif and sits
within 98% of exactly that:

```
accuracy = (1 − |measured − fraction| / fraction) × 100
```

The fraction is searched over every denominator up to the limit set under
**Guides → Reading** (eighths by default). The Measurements panel also gives the raw
pixel length and the exact decimal ratio, which is often the more honest number.

## Snapping

With **Snap** on (`S`), line ends and circle centres catch on other shapes first
(their ends, midpoints and centres, then anywhere along a line or a circle's ring),
then on grid crossings. Circles grow in half squares. The alif is never snapped,
since the grid hangs from it.

## Proofs of the alif

- **Key** (`K`): the dā'ira, a circle one alif across with a vertical line one alif
  long through its centre. It snaps to the grid, and takes its colours from the circles
  and lines on the page, so it shows the viewer that they are all measured in the one
  unit.
- **Alif in dots** (`N`): the alif as it is traditionally proved, a column of rhombic
  dots stacked tip to tip, one to each grid square.

Both are placed from the left rail or the **Guides** tab, and there is one of each.

## Colour and thickness

The bar above the canvas works on whatever is selected. With nothing selected it sets
the ink and thickness for new marks. The thickness slider starts in the middle at the
page's default; left goes down to a tenth of it, right up to four times it. **Apply to
all** colours, or sets the thickness of, every line or every circle at once. The
palette is deliberately fluorescent so marks stay legible over ink and toned paper.

## What's shown

**Alif measure** (`H`) and **Labels** (`T`) sit at the right of that bar. Hiding the
alif measure keeps the grid and every ratio; it is only out of sight, here and in the
export. The **Guides** tab holds the key and dots, the grid (on or off, its opacity
and colour), these display switches, and the reading settings: whether circles read
by diameter or radius, and how fine a fraction to look for.

## Controls

`?` in the top bar lists these too.

| | |
|---|---|
| `V` | select and move |
| `A` | measure the alif |
| `C` `L` | circle or line by ratio |
| `M` | measure freehand (press again: line or circle) |
| `K` `N` | place the key, the alif in dots |
| `G` `S` | grid, snap |
| `H` `T` | alif measure, labels |
| `Esc` | stop placing (the ratio palette returns), then put the tool down |
| `Backspace` | delete the selection |
| `Ctrl+Z` · `Ctrl+Shift+Z` | undo, redo |
| Drag empty space, or hold `Space` | pan |
| Scroll · `0` | zoom · fit to view |
| Drag the dial | straighten · `Shift` for hair-fine · `[` `]` a tenth of a degree |

## Notes

- Measurements are in image pixels, so they are only as accurate as the photograph.
  A page shot at an angle will not give honest ratios, so shoot flat-on.
- The sample specimen is set in [Amiri](https://github.com/alif-type/amiri), with the
  alif already measured and a circle whose diameter is that alif.

## Layout of the repo

| | |
|---|---|
| `index.html` | the whole app, built; this is the file to download |
| `src/` | the source: `partA.html` (markup and styles), `partB.js` and `partC.js` (interface), wrapped around the drawing and measuring code in `core.html` by `build.py` |
| `src/logo.html` | the منسوب wordmark, drawn on a grid in code, and its working |
| `docs/` | the website, served by GitHub Pages: a copy of the app as `index.html`, `app.html` for old links, and `og.png` for link previews |
| `build.sh` | builds `index.html` from `src/` and refreshes `docs/` |

## Licence

MIT, see [LICENSE](LICENSE).
