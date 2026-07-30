# ISTB Visualizer

A browser-only dashboard for visualizing Internet Speed Test Bot (ISTB) data —
drop in your exported results file and get an instant, rich picture of your
ISP's real-world performance: download/upload trends, latency & bufferbloat,
jitter, per-source comparisons, time-of-day patterns, error rates, and a
screenshot-ready summary for disputing underperformance with your provider.

No server, no account, no upload to anyone — everything runs and stays in
your browser.

## What is ISTB?

ISTB is a lightweight speed-testing bot, designed to run continuously on a
Raspberry Pi or similar device, that logs results — download/upload
throughput, latency, loaded latency, jitter — across multiple test types and
file sizes, over time. This visualizer is the companion dashboard for
exploring that exported data.

## Features

- **Overview** — a clean snapshot of your default test's download and upload
  over time, split by file size with a shaded min–max spread band. Built for
  the "what am I actually getting" glance, and for screenshotting.
- **Trends** — deep-dive on a single test type at a time: pick the test,
  the metric (download/upload/latency/jitter), toggle file sizes on and off,
  switch between raw and daily-averaged views.
- **Compare** — line up every test source (e.g. multiple CDNs) at a chosen
  file size, to see which routes are fast and which are the bottleneck.
- **Latency & bufferbloat** — unloaded vs. loaded latency, with the gap
  between them shaded so bufferbloat is visible at a glance.
- **Jitter** — stability of your connection over time.
- **Time of day** — average performance by hour, to spot peak-time
  congestion or throttling.
- **Reliability** — error rate over time, with failure reasons broken down.
- **ISP evidence** — enter your advertised speeds and an underperformance
  threshold to generate a plain-language, shareable summary of sustained
  underperformance, with percentile-based stats.

## Data format

Drop in a `.csv` or `.json` export from your ISTB instance. Expected fields
per row:

```
timestamp, test, file_size, download_mbps, upload_mbps,
latency_ms, loaded_latency_ms, jitter_ms, server, status, error_msg
```

- `file_size` is one of `small`, `medium`, `large` (adjust to match your
  bot's actual sizes).
- `status` is `ok` or `error`; error rows carry `error_msg` and null metrics.
- Test types are discovered from the file itself rather than hardcoded, so
  adding or removing tests on the bot side requires no changes here.

A sample file is bundled with the project — see Demo mode below to try the
dashboard instantly.

## Demo mode

To see the dashboard fully populated without providing your own file, open
the site with `?demo=true` appended to the URL. This loads a bundled sample
dataset automatically, with a banner making clear you're viewing sample data
and a one-click way back to the normal upload screen.

A downloadable sample file is also available directly on the drag-and-drop
landing page, for anyone who wants to try the real upload flow with a real
file.

## Tech stack

- Vanilla JavaScript, no framework
- Chart.js for all charting
- Vite for local dev tooling and bundling
- Deployed as a static site (Azure Static Web Apps)

All dependencies are bundled at build time — nothing is loaded from a CDN at
runtime, so the app works fully offline once loaded and carries no external
network dependency in production.

## Project structure

```
├── css/
│   └── styles.css
├── js/
│   ├── views/            one file per dashboard tab
│   │   ├── cdn.js            Compare tab
│   │   ├── dispute.js        ISP Evidence tab
│   │   ├── instrument.js     header readouts & verdict
│   │   ├── jitter.js         Jitter tab
│   │   ├── latency.js        Latency & Bufferbloat tab
│   │   ├── overview.js       Overview tab
│   │   ├── reliability.js    Reliability tab
│   │   ├── speed.js          Trends tab
│   │   └── tod.js            Time of Day tab
│   ├── chart-helpers.js  shared chart/band/fill construction
│   ├── data-loader.js    CSV/JSON parsing & normalization
│   ├── main.js           app entry point
│   ├── state.js          shared + per-tab UI state
│   └── utils.js
├── payload/
│   └── demo_results.csv  bundled sample dataset for demo mode
└── index.html
```

## Getting started

```bash
npm install
npm run dev
npm run build
```

Open the local dev URL, then drag in a `.csv` or `.json` results file, or
append `?demo=true` to explore with sample data first.

## Deployment

This project deploys to Azure Static Web Apps directly from GitHub:

1. Connect the repo in the Azure portal.
2. Build config: app location `/`, output location `dist`.
3. Push to the default branch — Azure builds and deploys automatically.

No backend, database, or server-side configuration is required.

## Privacy

Your data file is parsed and rendered entirely client-side. Nothing is
uploaded, transmitted, or stored anywhere outside your own browser session.

## Known limitations

- SQLite (`.db`) file support has been intentionally left out of the
  browser app to avoid a WASM runtime dependency — `.csv` and `.json` are
  the supported formats. SQLite export remains available on the bot side
  for anyone who wants to query the raw data with SQL directly.
- A few UI thresholds (error-rate warning levels, the default
  underperformance threshold) are reasonable defaults rather than values
  tied to a specific regulatory standard, and can be adjusted to fit your
  situation.

## License

This project is released under the MIT License.

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.