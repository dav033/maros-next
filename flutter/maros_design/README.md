# maros_design

The MARO design system (contract **Rev. E**) and the money-line widget, ported to
Flutter from the `maros-next` web app.

Three things live here and nothing else:

| Piece | File | Ported from |
| --- | --- | --- |
| Colour, elevation, shape and type tokens | `lib/src/tokens/` | `maros-next/src/styles/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx` |
| One Material 3 dark theme built from those tokens | `lib/src/theme.dart` | the same `:root` block |
| The money line: pure arithmetic + the widget | `lib/src/money_line_geometry.dart`, `lib/src/widgets/money_line.dart` | `src/features/project/presentation/molecules/moneyLineGeometry.ts`, `MoneyLine.tsx` |

No third-party dependencies. Only `dart:core`, `package:flutter/material.dart`
and `package:flutter_test`.

---

## ⚠️ NOTHING HERE HAS BEEN COMPILED, ANALYSED OR RUN

The machine this package was written on **has no Flutter SDK** (`flutter` and
`dart` are both absent from `PATH`). So:

* no `flutter analyze` has ever seen this code;
* no `flutter test` has ever run `test/money_line_geometry_test.dart`;
* no widget has ever been rendered, so the money line has never been *looked at*.

The code is written to be verifiable by reading — boring Dart, no exotic APIs, no
third-party packages, a comment on anything non-obvious — but "reads correctly" is
not "compiles". Treat the first run as a review step, not a formality.

**First thing to do on a machine with Flutter:**

```bash
cd maros-flutter
flutter pub get
flutter analyze          # expect this to be the step that finds any typo
flutter test             # 9 cases ported one-for-one from vitest, plus 2 extra
```

The tests are the real contract with the web. `test/money_line_geometry_test.dart`
is a case-by-case port of `moneyLineGeometry.test.ts` with the **same numbers**, so
if a case fails here and passes there, this port is wrong — not the web.

---

## ⚠️ Fonts: the failure mode is silence

The web loads three families (`src/app/layout.tsx`):

* **Archivo** — display / headings (`font-display`)
* **IBM Plex Sans** — body (`font-sans`)
* **IBM Plex Mono** — **figures** (`font-mono`)

`MarosTypography` asks for those exact family names, and the money line's amounts
use the mono face, because a money column only lines up when every digit has the
same width.

**No font files are shipped in this package.** The `fonts:` block in
`pubspec.yaml` is written out in full and left **commented out**, because a
`fonts:` entry pointing at a missing asset is a hard build error that would break
`flutter test` for everyone.

Until the files are supplied, Flutter resolves the unknown family by **silently
falling back to the platform font**. Nothing throws, nothing is logged, the screen
looks fine — and the figures quietly lose their tabular alignment. That is the
exact bug the web just fixed; do not let it come back through the side door.

Pick one:

1. **Ship the files.** Drop the `.ttf` files under `fonts/` with the names listed
   in `pubspec.yaml` and uncomment the block.
2. **Use `google_fonts` in the consuming app** (not here — this package stays
   dependency-free) and build the text theme with `GoogleFonts.archivo()`,
   `GoogleFonts.ibmPlexSans()` and `GoogleFonts.ibmPlexMono()`.

Either way, *check a screenshot of a money column before calling it done*.

---

## The one rule about colour

From `globals.css`, and enforced here by putting the two families in two classes:

* **`MarosColors.primaryMint` and its family are INTERFACE.** Navigation, focus
  rings, the primary button. Never inside a piece of data.
* **`MarosMoneyColors.*` (`--money-*`) is DATA.** The money line and the status
  badges. Never chrome.

`MarosMoneyColors.cashIn` (`#4ED0A0`) and `MarosColors.primaryMint` (`#5FE3C4`)
are close on purpose — one brand — and distinct on purpose: a collected-cash bar
must never read as a control. The theme in `lib/src/theme.dart` exposes the mint
through `colorScheme.primary` and exposes **no money token at all**, so nothing
can pick one up by accident from `Theme.of(context)`.

## Elevation is a surface, not a shadow

`--elev-0 … --elev-5` are six opaque surfaces. To raise something, pick the next
rung — do not stack translucency and do not cast a shadow. `MarosTheme` sets
`shadowColor` and `surfaceTintColor` to fully transparent and keeps Material
`elevation` at 0 for this reason: Material 3's default depth model is an alpha
tint over the surface, which is the same mistake the web had to undo (washes over
an `elev-2` row composited down to a ~1.03:1 step, i.e. no visible boundary).

## Using it

```dart
MaterialApp(
  theme: MarosTheme.dark(),
  home: ...,
);
```

```dart
// A single project card: elastic axis, so the whole overrun is visible.
MoneyLine(
  label: 'Riverside remodel',
  estimate: 100000.0,
  collected: 50000.0,
  spent: const MoneyValue(128000.0),
  backlog: const MoneyValue(12000.0),
)

// A row in the projects list: pinned axis, so the contract marker lands on the
// same x in every row and the rows can be compared.
MoneyLine(
  label: project.name,
  estimate: project.estimate,
  collected: project.collected,
  spent: MoneyValue(project.spent),
  axisMaxPercent: kListAxisMaxPercent,
)
```

`spent` and `backlog` are wrapped in `MoneyValue` for one reason: TypeScript can
tell `undefined` ("this lane does not exist here") from `null` ("the lane exists
and is empty"), and Dart cannot. Passing `null` omits the lane; passing
`MoneyValue.noData` draws the lane with an em dash.

## What the money line promises

These are the properties `money_line_geometry.dart` exists to hold. They are the
reason it is a separate, Flutter-free file with its own tests:

1. **Nothing is clipped in silence.** A value past a fixed axis is drawn at the
   axis end, flagged `clipped`, and still reports its real amount and its real
   percentage. The widget prints "runs off the end of the axis" in the tooltip and
   the semantics value, and draws a bitten cut edge.
2. **No absolute values.** A loss of 40k sits left of zero; a profit of 40k sits
   right of it. They can no longer be confused.
3. **The contract is the track, not a bar against itself.** One axis per project;
   every lane is measured against it.
4. **No contract (null, zero or negative) means an EMPTY track.** "No data" is not
   "zero", and an empty track never reads as "nothing spent".
5. **A bar clipped to nothing keeps a visible sliver** (2% of the axis), so it
   does not vanish and its tooltip is still reachable.
6. **The contract marker paints above the bars.** A bar that crosses the contract
   edge would otherwise paint over the line it is crossing.
7. **Every amount carries its printed label.** Identity never depends on colour
   alone.
