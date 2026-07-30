# Help — Understanding your results

This page explains what each part of the dashboard shows and what the terms
mean, in plain language. You shouldn't need to look anything up elsewhere —
if something here isn't clear, that's a bug in this page, not in you.

---

## What am I looking at?

### Overview
Your headline picture: how fast your connection actually is, over time,
split into small/medium/large test downloads and uploads. Use this to
answer "what am I really getting from my internet?" at a glance — it's also
the best view to screenshot if you want to show someone what your
connection typically looks like.

### Trends
A closer look at one specific test at a time. Pick a test and a measurement
(speed, latency, jitter) and watch it change over the days or weeks you've
been testing. Good for spotting whether things are getting better, worse,
or staying the same.

### Compare
Puts different test sources side by side, so you can see whether one is
consistently faster or slower than the others. If one line sits well below
the rest, that specific route may be the weak link — not necessarily your
whole connection.

### Latency & Bufferbloat
Shows how quickly your connection responds when it's sitting idle, versus
when it's busy downloading something. If the two lines stay close together,
your connection handles multitasking well. If the "busy" line jumps up a
lot, that's called bufferbloat — it's why a video call can start stuttering
the moment someone else in the house starts a large download.

### Jitter
Shows how steady your connection's responsiveness is from one moment to the
next. A flat, low line means a stable connection. A spiky line means your
connection is prone to little hiccups — the kind that make calls choppy or
online games feel laggy, even if your overall speed looks fine.

### Time of Day
Averages your results by hour, across all the days you've tested, to reveal
whether your connection tends to slow down at certain times — for example,
in the evening when everyone in the neighborhood is online at once.

### Reliability
Shows what fraction of your tests failed outright, and when. Useful for
spotting outages, dropouts, or patches of time when your connection wasn't
working reliably at all.

### ISP Evidence
Enter the speed your provider advertised, and this page builds a plain,
factual summary comparing that promise to what you actually measured —
including how often you fell meaningfully short of it. It's designed to be
something you can screenshot and send straight to your provider, or use as
supporting evidence in a complaint.

---

## What do these words mean?

### Speed (throughput)
How much data your connection can move in a second, usually measured in
Mbps (megabits per second). This is what people usually mean when they say
"my internet is fast" or "slow." Downloading is data coming to you; upload
is data going out from you — most home connections are quite a bit faster
at downloading than uploading.

### Latency (ping)
How long it takes for a small signal to reach a server and come back —
usually just a few thousandths of a second (milliseconds). Think of it as
"reaction time" rather than speed: a connection can be fast (good download
speeds) but still feel laggy (high latency), or vice versa. Low latency
matters most for anything happening in real time — calls, video chats,
online games.

### Bufferbloat
What happens when your connection gets so busy that everything else sharing
it starts lagging. It's why a call can suddenly stutter the moment a big
download or backup kicks off in the background — the download fills up a
queue inside your router or modem, and everything else has to wait in line
behind it. We measure this by checking your latency once with the
connection idle, and again while a download is actively running — a big
jump between the two is bufferbloat.

### Jitter
How much your latency wobbles from one moment to the next, rather than how
high it is. Imagine two connections that both average the same "reaction
time" — one stays steady every time, the other swings wildly high and low.
The steady one will feel smooth on a call; the wobbly one will feel choppy,
even though its average looks identical. Low, flat jitter is good; spiky
jitter means an unstable connection.

### Median
The "typical" value — if you lined up every test result from lowest to
highest, the median is the one sitting right in the middle. We use the
median instead of a plain average because a handful of unusually bad (or
unusually good) results can drag an average in a misleading direction. The
median tells you what a normal, ordinary test looked like.

### p5 and p95 (percentiles)
A way of describing your worst and best typical results, without being
thrown off by a one-off fluke. "p5" means 5% of your tests were slower than
this — so it's roughly "even on a bad day, this is about what you got." "p95"
is the mirror image — roughly your best typical result, not counting rare
lucky bursts. These numbers are widely used by network engineers and
regulators for exactly this reason: they're a fair, hard-to-argue-with way
to describe "how bad does it usually get," rather than cherry-picking a
single best or worst result.

### Spread band (the shaded area on some charts)
On charts with more than one line (for example, small/medium/large file
downloads), the shaded area shows the full range between your slowest and
fastest result at each point in time. A wide band means the different
sizes performed very differently; a narrow band means they were all
roughly the same.

### Error rate
The percentage of tests that failed to complete at all, rather than just
running slow. A rising error rate, or a cluster of errors around a specific
time, often points to an outage or a genuinely broken connection rather
than ordinary slowness.

### Test cycle
One full round of testing — typically your bot runs several tests back to
back (for example, a small file, then a medium file, then a large file) and
we group those together as a single cycle when building certain charts.

### File size (small / medium / large)
Each test cycle downloads (and sometimes uploads) files of different sizes.
Small files tend to measure slightly slower speeds, because a connection
takes a moment to "get up to speed" before hitting its true capacity — a
brief transfer often ends before that happens. Large files give the
connection time to reach full speed, so they tend to show your true
sustained performance. This is completely normal and not a sign anything is
wrong.

### Advertised speed / underperformance threshold
"Advertised speed" is what your provider promised you'd get. The
"underperformance threshold" is a line you choose (for example, half of the
advertised speed) — any test result below that line counts as
"underperforming" in your summary. You can adjust this depending on how
strict you want the comparison to be.