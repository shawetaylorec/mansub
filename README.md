# Mansub · منسوب

A small tool for measuring proportion in Arabic calligraphy.

Everything in the classical system is measured against one reference — the height
of the alif. Mansub asks you for that height once, builds a grid from it, and then
reports every line and circle you draw as a fraction of the alif, with a score for
how close the fit is.

**[shawetaylorec.github.io/mansub](https://shawetaylorec.github.io/mansub/)** — the site,
and the tool itself runs at [/app.html](https://shawetaylorec.github.io/mansub/app.html).

**One file, no install.** Download `index.html` and open it in a browser. Nothing is
uploaded anywhere; the image stays on your machine.

## Layout of the repo

| | |
|---|---|
| `index.html` | the whole app — this is the file to download |
| `docs/` | the website, served by GitHub Pages |
| `docs/app.html` | a copy of the app, so the site can launch it |
| `build.sh` | refreshes that copy after you change `index.html` |

## Using it

1. **Open image** (or drag one onto the canvas, or paste with `Ctrl+V`).
2. If the page was shot askew, **drag the dial** beneath the image to straighten it.
   A pixel of drag is 0.05°, and holding `Shift` makes it 0.005°, so a quarter of a
   degree is reachable; `[` and `]` nudge by a tenth. There is a detent at square, the
   readout turns gold once you are off it, and clicking the readout straightens back.
   `90°` handles a photograph that came in sideways.

   The alif and its grid stay together while the photograph turns under them, so you
   straighten until the script lines up rather than tilting the grid to chase it. Lines
   and circles already placed turn with the sheet and stay on the letters they measure;
   the alif, the key and the dots stay on the grid.

   **Crop** (on by default) trims the turned sheet back to the largest upright
   rectangle that still fits inside it, the way straightening works in Google Photos —
   so you get a square-edged image rather than a picture at a jaunty angle. What falls
   outside is dimmed rather than hidden, so you can see what you are giving up. Turn it
   off to keep the whole tilted sheet, blank corners and all.
3. Pick the **Alif** tool and drag from the top of an alif to its foot. The measure
   is locked to true vertical, so the grid always runs square to the image; if the
   alif on the page leans, straighten the image with the dial rather than the alif.

   Once it is set, untick **Show alif measure** (or press `H`) to hide the measure
   itself. The grid and every ratio still follow it — it is only out of sight, which
   helps when you are drawing several alifs of your own over the page.
4. A grid appears, subdivided into equal parts of that alif — 8 by default, with
   5 and 9 offered because those are the usual nuqta counts for naskh and thuluth.
   Heavier lines fall on whole alifs.
5. Draw with the **Line** and **Circle** tools. Circles are drawn from the centre
   outwards and are always true circles. Tick **Snap to grid** (or press `S`) and
   line ends and circle centres land on grid crossings, and circles grow in half
   squares so their diameter is a whole number of squares. Near another line or
   circle, a point catches on that shape instead: first its ends, midpoint or
   centre, then anywhere along the line or the circle's ring, marked with a small
   ring while you drag. A circle's edge catches the same way. Moved shapes snap
   too, and exact-ratio shapes keep their size and snap their centre or first end.
   The alif is never snapped, since the grid hangs from it.
6. Each shape is labelled with its ratio to the alif — `1/4 (98%)` means the shape
   is nearest to a quarter of an alif and sits within 98% of exactly that.
7. **Export PNG** writes the image, the grid and your marks out as one picture. The
   dialog offers 1× to 4× the sheet's own pixels and shows you the resulting dimensions
   and file size before you save. It opens on whatever multiple gets the long edge past
   about 2600px, because a sheet exported at 1× is often smaller than you want — the
   upscale adds no detail to the photograph, but it does keep the rules and labels
   crisp at print size.

## The key

**Add key** (or `K`) places a key on the sheet: the dā'ira, a circle one alif
across, with a vertical line one alif long running through its centre. It follows
the pointer until you click, and wherever you drop or drag it, it snaps so the line
lies along a grid column and runs from one grid row to another.

It takes its colours from the page rather than the Ink panel: the circle is drawn in
whichever colour most of your circles use, and the line in whichever colour most of
your lines use. Use **Colour all** to set every circle one colour and every line
another, and the key follows, so it shows the viewer that the lines and circles are
all measured in the one unit. `Move key` re-places it, `Remove` or `Backspace` takes
it away.

## The alif in dots

**Add dots** (or `N`) places the alif the way it is traditionally proved: a column
of rhombic dots, the nuqat, stacked tip to tip. Each dot is one grid square turned
on its corner, so its diagonals are exactly one division of the alif, and there are
as many dots as the grid has divisions — 8 by default, 5 or 9 if you change the
grid. The column snaps into a grid column, from one grid row to another, and follows
the grid if you change its divisions. It is drawn in the current ink; select it and
click a colour to recolour it.

## Working the other way round

Measuring answers *what is this?* The **Exact ratios** panel answers *where does a
quarter of an alif actually fall?* Choose Circle or Line, click a ratio — eighths
through two alifs, or type any fraction you like — and you get a shape of exactly
that dimension, which then follows the pointer until you click to place it. It is
exact by construction, so its label always reads 100%. `Esc` cancels.

Place one and drag it over a letter to test a hypothesis, rather than drawing by
eye and hoping the number lands where you wanted.

## Reading the numbers

The fraction shown is the closest simple fraction of an alif, searched over every
denominator up to the limit you set (quarters through sixteenths; eighths by
default). The percentage is how near the true measurement is to that fraction:

```
accuracy = (1 − |measured − fraction| / fraction) × 100
```

So `1/4 (98%)` is a near-exact quarter. `1/2 (75%)` means the nearest fraction
available was a half, but the shape is well off it. Widen the denominator limit if
you want finer fractions; narrow it if you only care about the simple divisions.

The Measurements panel also gives the raw pixel length and the exact decimal
ratio, which is often the more honest number of the two.

## Controls

| | |
|---|---|
| `V` `A` `L` `C` | Select, Alif, Line, Circle |
| `K` | place the key |
| `N` | place the alif in dots |
| `Shift` while drawing | snap a line to 15° steps |
| Drag empty space, or hold `Space` | pan |
| Scroll | zoom · `0` fits the image to the view |
| `Backspace` | delete the selection |
| `Ctrl+Z` | undo |
| Drag the dial | straighten · `Shift` for hair-fine · `[` `]` nudge a tenth of a degree |
| `G` | show/hide the grid |
| `S` | snap to the grid and to other shapes, on/off |
| `H` | show/hide the alif measure (the grid stays) |

Clicking a colour recolours the selected shape as well as setting the colour for
the next one. **Colour all · Lines / Circles** in the Ink panel paints every line,
or every circle, in the current colour at once. The palette is deliberately fluorescent so the marks stay legible
over ink and toned paper. All strokes share one thickness, set in the Ink panel.
The grid is black by default, since most scans are pale; it can be set to white or
any of the fluorescents, and its weight is a slider.

## Notes

- Measurements are in image pixels, so they are only as accurate as the photograph.
  A page shot at an angle will not give honest ratios — shoot flat-on.
- **Circles read as** switches the measured quantity between diameter and radius.
- The alif measure is always true vertical and the grid always square to the image,
  so the alif sits exactly on the grid; straightening is done by turning the image.
- The app opens on a sample specimen set in [Amiri](https://github.com/alif-type/amiri),
  with the alif already measured and a circle whose diameter is that alif — the
  classical dā'ira. Open your own image to replace it.

## Licence

MIT — see [LICENSE](LICENSE).
