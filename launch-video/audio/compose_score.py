"""Original hybrid-orchestral score for the full film (BanxueFilm, 2120 frames = 70.67 s).

Synthesised from scratch (no samples): string ensembles (detuned band-limited saws with vibrato),
spiccato ostinato in 3+3+2 accents, low brass swells, taiko, electronic kick/clap/hats, convolution
hall. A minor, 85.7 BPM: one beat = 0.7 s = 21 film frames, so beat n sits on frame 21n.

Beat map against the film (scene starts in frames / 21):
  0-10   opening: module chimes 0.5-3, fold hit 5, wordmark pad
  10-20  活动: ostinato enters filtered, detail read on the build, breath 19.5, drop 20 (标记参与)
  20-44  社区: drop A, hook from 28
  44-59  找搭子: drop B with arp
  59-71  Coffee Chat: breakdown, no kick
  71-82  校友同行: build, dominant E from 79
  82-93  校园 AI: climax, hook doubled
  93-95  finale line: tremolo on E, breath
  95     icon: final hit, Am tail to the end
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
BEAT = 0.7
DUR = 2120 / 30
N = int(SR * DUR)
rng = np.random.default_rng(20261013)
BUS = {k: np.zeros((2, N)) for k in ("strings", "brass", "drums", "synth", "fx")}
KICKS = []


def place(sig, beat, gain=1.0, pan=0.0, bus="strings"):
    i = int(round(beat * BEAT * SR))
    if i < 0 or i >= N:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    a = (pan + 1) * np.pi / 4
    BUS[bus][0, i:j] += s * np.cos(a) * np.sqrt(2)
    BUS[bus][1, i:j] += s * np.sin(a) * np.sqrt(2)


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], "band", fs=SR, output="sos"), x)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def blep_saw(freq_t):
    """Band-limited (polyBLEP) saw from an instantaneous-frequency array."""
    dt = freq_t / SR
    ph = (rng.random() + np.cumsum(dt)) % 1.0
    s = 2 * ph - 1
    a = ph < dt
    t = ph[a] / dt[a]
    s[a] -= t + t - t * t - 1
    b = ph > 1 - dt
    t = (ph[b] - 1) / dt[b]
    s[b] -= t * t + t + t + 1
    return s


def ensemble(freq, n, voices=7, cents=14, vib=0.0035, vib_delay=0.18):
    """`freq` is a scalar or per-sample array; each player detuned, with its own vibrato."""
    t = np.arange(n) / SR
    base = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    out = np.zeros(n)
    for k in range(voices):
        d = ((k / (voices - 1)) - 0.5) * 2 * cents if voices > 1 else 0.0
        rate = 5.2 + rng.uniform(-0.5, 0.5)
        depth = vib * np.clip((t - vib_delay) / 0.4, 0, 1)
        f = base * 2 ** (d / 1200) * (1 + depth * np.sin(2 * np.pi * rate * t + rng.uniform(0, 6.3)))
        out += blep_saw(f)
    return out / np.sqrt(voices)


def bowed(m, dur, attack=0.25, release=0.45, cutoff=3200, voices=7, tremolo=0.0):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    s = ensemble(hz(m), n, voices)
    s = lp(s, cutoff, 2) + 0.35 * bp(s, 220, 900, 1)
    env = np.clip(t / attack, 0, 1) ** 2 * np.clip((dur + release - t) / release, 0, 1)
    if tremolo:
        env *= 0.55 + 0.45 * np.abs(np.sin(np.pi * tremolo * t))
    return hp(s, 60) * env * 0.12


def spiccato(m, vel=1.0, cutoff=4200):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    s = lp(ensemble(hz(m), n, 4, 10, 0.0), cutoff * (0.6 + 0.4 * vel), 2)
    bow = bp(rng.standard_normal(n), 1800, 6500) * np.exp(-t * 220) * 0.25
    env = np.clip(t / 0.004, 0, 1) * np.exp(-t * (26 - 8 * vel))
    return (s + bow) * env * 0.16 * vel


def gliss(m0, m1, dur, cutoff=4000):
    n = int((dur + 0.4) * SR)
    t = np.arange(n) / SR
    k = np.clip(t / dur, 0, 1) ** 1.6
    s = lp(ensemble(hz(m0) * 2 ** ((m1 - m0) * k / 12), n, 9, 18), cutoff, 2)
    env = np.clip(t / 0.15, 0, 1) * np.clip((dur + 0.4 - t) / 0.4, 0, 1) * (0.3 + 0.7 * k)
    return s * env * 0.11


def brass(m, dur, cutoff=2400):
    n = int((dur + 0.35) * SR)
    t = np.arange(n) / SR
    s = ensemble(hz(m), n, 3, 6, 0.002)
    e = np.clip(t / 0.18, 0, 1) * np.exp(-np.clip(t - 0.18, 0, None) * 0.8)
    out = lp(s, 450) * (1 - e) + lp(s, cutoff) * e
    env = np.clip(t / 0.06, 0, 1) * np.clip((dur + 0.35 - t) / 0.35, 0, 1)
    return np.tanh(out * 1.6) * env * 0.11


def bell(m, length=1.6, gain=0.16):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t + 0.7 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6)) + 0.35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4)
    return s * np.exp(-t * 2.8) * gain


def pluck(m, gain=0.12):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    s = lp(ensemble(hz(m), n, 3, 8, 0.0), 3600, 2)
    return s * np.clip(t / 0.002, 0, 1) * np.exp(-t * 14) * gain


# ---------------- percussion ----------------
def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 130 * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t * 260) * 0.12
    return np.tanh((body + click) * 1.5) * 0.8


def kick_at(b, g=1.0):
    place(kick(), b, g, bus="drums")
    KICKS.append((b * BEAT, g))


def taiko(f0=58, length=1.4):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f0 + 70 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    skin = lp(rng.standard_normal(n), 900) * np.exp(-t * 26) * 0.6
    return np.tanh((body + skin) * 1.3) * 0.7


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 7000)
    e = sum(np.exp(-np.clip(t - o, 0, None) * (220 if k < 2 else 20)) * (t >= o) for k, o in enumerate([0, 0.011, 0.022]))
    return noise * e * 0.3


def snare(g=1.0):
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return (bp(rng.standard_normal(n), 1400, 9000) * np.exp(-t * 28) * 0.35 + tone) * g


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t * (14 if open_ else 80)) * (0.2 if open_ else 0.18)


def cymbal(length=3.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4500, 2) * np.exp(-t * 1.4) * 0.14


def boom():
    n = int(3.6 * SR)
    t = np.arange(n) / SR
    f = 34 + 64 * np.exp(-t * 8)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3) * 1.4) * 0.75


def riser(beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    k = t / t[-1]
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    for s in range(0, n, 2048):
        fc = 400 + 7500 * k[s] ** 2
        out[s : s + 2048] = bp(noise[s : s + 2048], fc * 0.6, fc * 1.5, 1)
    return out * 0.3 * k ** 2


def roll(b0, b1, g0, g1, step=0.25, fn=snare, bus="drums"):
    b = b0
    while b < b1 - 1e-6:
        k = (b - b0) / (b1 - b0)
        place(fn(), b, g0 + (g1 - g0) * k, rng.uniform(-0.2, 0.2), bus)
        b += step


# ---------------- harmony ----------------
CH = {  # bass root, ostinato root, pad voicing
    "Am": (33, 57, [57, 60, 64, 69]),
    "F": (29, 53, [57, 60, 65, 69]),
    "C": (36, 60, [55, 60, 64, 67]),
    "G": (31, 55, [55, 59, 62, 67]),
    "E": (28, 52, [56, 59, 64, 68]),
}
SEGS = [(0, 10, "Am"), (10, 14, "Am"), (14, 16, "C"), (16, 18, "F"), (18, 20, "E")]


def cycle(b0, b1, names, step=2):
    b, i = b0, 0
    while b < b1:
        SEGS.append((b, min(b1, b + step), names[i % len(names)]))
        b += step
        i += 1


CYC = ["Am", "F", "C", "G"]
cycle(20, 44, CYC)
cycle(44, 59, CYC)
cycle(59, 71, ["Am", "F", "C"], 4)
cycle(71, 79, CYC)
SEGS.append((79, 82, "E"))
cycle(82, 93, CYC)
SEGS += [(93, 95, "E"), (95, 102, "Am")]


def chord_at(b):
    for s, e, c in SEGS:
        if s <= b < e:
            return c
    return "Am"


def pads(b0, b1, gain, cutoff, hi=False, low=True):
    for s, e, c in SEGS:
        if e <= b0 or s >= b1:
            continue
        s, e = max(s, b0), min(e, b1)
        bass, _, voicing = CH[c]
        d = (e - s) * BEAT
        for i, m in enumerate(voicing):
            place(bowed(m, d, 0.2, 0.5, cutoff), s, gain, -0.5 + i * 0.33)
            if hi:
                place(bowed(m + 12, d, 0.25, 0.5, cutoff * 1.3, 5), s, gain * 0.5, 0.5 - i * 0.33)
        if low:
            place(bowed(bass + 12, d, 0.15, 0.5, 1400, 7), s, gain * 1.1, -0.15)
            place(bowed(bass, d, 0.15, 0.5, 900, 5), s, gain * 0.9, 0.1)


# 3+3+2 accents across eight sixteenths: root, fifth, octave per group.
PATTERN = [(0, 1.0), (7, 0.62), (12, 0.7), (0, 0.95), (7, 0.62), (12, 0.7), (7, 0.9), (12, 0.66)]


def ostinato(b0, b1, g0, g1, c0, c1, upper=False):
    for s16 in range(int(round(b0 * 4)), int(round(b1 * 4))):
        b = s16 / 4
        k = (b - b0) / max(1e-6, b1 - b0)
        root = CH[chord_at(b)][1]
        off, v = PATTERN[s16 % 8]
        g = g0 + (g1 - g0) * k
        cut = c0 + (c1 - c0) * k
        place(spiccato(root + off - 12, v, cut), b, g, -0.3)
        place(spiccato(root + off, v, cut), b, g * 0.8, 0.3)
        if upper:
            place(spiccato(root + off + 12, v, cut), b, g * 0.4, 0.55)


def brass_swells(b0, b1, gain):
    for s, e, c in SEGS:
        if e <= b0 or s >= b1:
            continue
        r = CH[c][0] + 12
        d = (min(e, b1) - max(s, b0)) * BEAT
        place(brass(r, d), max(s, b0), gain, -0.2, "brass")
        place(brass(r + 7, d), max(s, b0), gain * 0.8, 0.2, "brass")
        place(brass(r + 12, d, 3000), max(s, b0), gain * 0.5, 0.0, "brass")


HOOK = [
    (0, 76, 1.5), (1.5, 74, 0.5), (2, 72, 1.0), (3, 77, 1.0), (4, 76, 1.5), (5.5, 72, 0.5), (6, 74, 2.0),
    (8, 76, 1.5), (9.5, 79, 0.5), (10, 81, 1.0), (11, 77, 1.0), (12, 79, 1.5), (13.5, 76, 0.5), (14, 74, 1.0), (15, 71, 1.0),
]


def hook(b0, b1, gain, octave=False, horn=False):
    for off, m, ln in HOOK:
        b = b0 + off
        if b >= b1:
            continue
        d = min(ln, b1 - b) * BEAT
        place(bowed(m, d, 0.06, 0.35, 5200, 9), b, gain, 0.15)
        if octave:
            place(bowed(m + 12, d, 0.06, 0.35, 6500, 7), b, gain * 0.45, -0.25)
        if horn:
            place(brass(m - 12, d, 2600), b, gain * 0.9, -0.1, "brass")


def drop_drums(b0, b1, taiko_g=0.5, busy=False):
    for b in range(int(b0), int(b1)):
        kick_at(b, 1.0 if b % 2 == 0 else 0.9)
        if b % 2:
            place(clap(), b, 0.75, bus="drums")
            place(snare(), b, 0.35, bus="drums")
        place(hat(True), b + 0.5, 0.6, 0.25, "drums")
        for s in range(4):
            place(hat(), b + s * 0.25, [0.45, 0.25, 0.0, 0.3][s], -0.25, "drums")
        if (b - b0) % 2 == 0:
            place(taiko(), b, taiko_g, -0.1, "drums")
        if busy:
            for off, g in ((0.75, 0.35), (1.5, 0.45)):
                if (b - b0) % 2 == 0:
                    place(taiko(78, 0.8), b + off, taiko_g * g * 2, 0.2, "drums")


# ---------------- 0-10: opening ----------------
pads(0, 10, 0.55, 1800, low=True)
place(bowed(81, 9 * BEAT, 2.0, 1.0, 5000, 5), 1, 0.25, 0.4)
for i, m in enumerate([69, 72, 76, 79, 81, 84]):
    place(bell(m), 0.5 + i * 0.5, 0.9, -0.45 + 0.18 * i, "synth")
place(taiko(52, 2.0), 5, 0.9, 0, "drums")
place(boom(), 5, 0.45, 0, "fx")
place(cymbal(2.4), 5, 0.6, 0, "drums")
place(bell(88, 2.4), 5.6, 0.9, 0, "synth")
place(gliss(57, 69, 1.4), 8, 0.9, 0.0)
place(riser(1), 9, 0.4, bus="fx")

# ---------------- 10-20: 活动 build, breath, drop ----------------
ostinato(10, 16, 0.55, 0.8, 1100, 2600)
ostinato(16, 19.5, 0.85, 1.15, 2600, 5000, upper=True)
pads(10, 19.5, 0.5, 2000)
for b in (10, 12, 14):
    place(taiko(), b, 0.45, 0, "drums")
for b in range(16, 19):
    place(taiko(), b, 0.5 + (b - 16) * 0.12, 0, "drums")
roll(16, 18, 0.12, 0.3, 0.5)
roll(18, 19.5, 0.3, 0.7, 0.125)
roll(17, 19.5, 0.2, 0.55, 0.125, lambda: taiko(46, 0.5))
place(riser(3.5), 16, 0.9, bus="fx")
place(gliss(52, 76, 3.3, 5000), 16, 0.6, 0.0)

# ---------------- 20-44: drop A (社区), hook from 28 ----------------
place(boom(), 20, 0.85, 0, "fx")
place(cymbal(), 20, 1.0, bus="drums")
drop_drums(20, 44)
ostinato(20, 44, 1.0, 1.0, 4800, 4800, upper=True)
pads(20, 44, 0.65, 2600)
brass_swells(20, 28, 0.8)
brass_swells(28, 44, 0.55)
place(cymbal(), 28, 0.7, bus="drums")
hook(28, 44, 1.0)
roll(43, 44, 0.25, 0.55, 0.125, lambda: taiko(70, 0.5))

# ---------------- 44-59: drop B (找搭子), arp ----------------
place(cymbal(), 44, 0.9, bus="drums")
place(boom(), 44, 0.4, 0, "fx")
drop_drums(44, 58, busy=True)
ostinato(44, 58.5, 1.0, 1.0, 5000, 5000, upper=True)
pads(44, 59, 0.6, 3000, hi=True)
brass_swells(44, 58, 0.6)
hook(44, 58, 0.75, octave=True)
for s16 in range(44 * 4, 58 * 4):
    b = s16 / 4
    tones = CH[chord_at(b)][2]
    place(pluck(tones[[0, 2, 1, 3][s16 % 4]] + 12), b, 0.9, -0.6 + (s16 % 4) * 0.4, "synth")
roll(58, 59, 0.3, 0.8, 0.125)

# ---------------- 59-71: breakdown (Coffee Chat) ----------------
place(cymbal(2.0), 59, 0.6, bus="drums")
ostinato(59, 71, 0.6, 0.75, 2400, 3200)
pads(59, 71, 0.6, 2400, hi=True)
for b in range(59, 71, 2):
    place(taiko(), b, 0.4, 0, "drums")
for e in range(59 * 2, 71 * 2):
    place(hat(), e / 2 + 0.5, 0.35, 0.3, "drums")
for b, m in ((59, 76), (63, 77), (67, 79)):
    place(bowed(m, 4 * BEAT, 0.5, 0.6, 5200, 9), b, 0.65, 0.2)

# ---------------- 71-82: build (校友同行) ----------------
for b in range(71, 75, 2):
    kick_at(b, 0.85)
for b in range(75, 79):
    kick_at(b, 0.9)
    if b % 2:
        place(clap(), b, 0.6, bus="drums")
ostinato(71, 81.5, 0.75, 1.15, 3000, 5200, upper=True)
pads(71, 82, 0.6, 2800)
brass_swells(75, 82, 0.6)
for b in range(71, 79):
    place(hat(), b + 0.5, 0.45, 0.25, "drums")
roll(79, 81, 0.2, 0.5, 0.25)
roll(81, 82, 0.5, 0.9, 0.0625)
roll(79, 82, 0.3, 0.7, 0.25, lambda: taiko(50, 0.6))
place(riser(3), 79, 0.95, bus="fx")
place(gliss(52, 81, 2.8, 5600), 79, 0.6, 0.0)

# ---------------- 82-93: climax (校园 AI) ----------------
place(boom(), 82, 0.9, 0, "fx")
place(cymbal(), 82, 1.1, bus="drums")
drop_drums(82, 92, taiko_g=0.65, busy=True)
ostinato(82, 92.5, 1.1, 1.1, 5200, 5200, upper=True)
pads(82, 93, 0.7, 3400, hi=True)
brass_swells(82, 93, 0.7)
hook(82, 93, 1.05, octave=True, horn=True)
place(cymbal(), 90, 0.6, bus="drums")
roll(92, 93, 0.35, 0.8, 0.125)

# ---------------- 93-95: finale line, then the icon hit ----------------
for m in (52, 59, 64, 68, 71):
    place(bowed(m, 1.75 * BEAT, 0.6, 0.15, 5000, 7, tremolo=12), 93, 0.75, rng.uniform(-0.4, 0.4))
place(bowed(28, 1.75 * BEAT, 0.5, 0.15, 900, 5), 93, 1.0)
place(riser(1.75), 93, 0.8, bus="fx")
roll(93.5, 94.75, 0.2, 0.75, 0.0625)

kick_at(95, 1.0)
place(boom(), 95, 1.0, 0, "fx")
place(taiko(48, 2.4), 95, 1.0, 0, "drums")
place(cymbal(4.0), 95, 1.2, bus="drums")
for i, m in enumerate([57, 60, 64, 69, 71, 76]):
    place(bowed(m, 5 * BEAT, 0.05, 1.6, 4200, 7), 95, 0.75, -0.5 + i * 0.2)
place(bowed(33, 5 * BEAT, 0.05, 1.6, 900, 5), 95, 1.1)
place(bowed(45, 5 * BEAT, 0.05, 1.6, 1400, 5), 95, 1.0)
for m in (45, 52, 57):
    place(brass(m, 3 * BEAT), 95, 0.8, 0, "brass")
for i, m in enumerate([81, 76, 72, 69]):
    place(bell(m, 2.6), 95.6 + i * 0.75, 0.7 - i * 0.12, -0.3 + 0.2 * i, "synth")

# ---------------- master ----------------
def hall(x, seconds=2.6, wet=0.3):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.stack([lp(rng.standard_normal(n), 6500) * np.exp(-6.9 * t / seconds) for _ in range(2)])
    ir[:, : int(0.018 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    return x + wet * np.stack([fftconvolve(x[c], ir[c])[: x.shape[1]] for c in range(2)])


t = np.arange(N) / SR
duck = np.ones(N)
for tk, g in KICKS:
    i = int(tk * SR)
    duck[i:] = np.minimum(duck[i:], 1 - 0.4 * g * np.exp(-(t[i:] - tk) / 0.12))

strings = hall(BUS["strings"], 2.8, 0.42)
brass_bus = hall(BUS["brass"], 2.4, 0.3)
synth = hall(BUS["synth"], 2.2, 0.35)
drums = hall(BUS["drums"], 1.6, 0.12)
mix = (strings * 1.0 + brass_bus * 0.8) * duck + synth * 0.9 + drums * 0.85 + BUS["fx"]
mix = hp(mix, 28)
mix = mix - 0.4 * lp(mix, 70, 1) + 1.6 * hp(mix, 2200, 1)
fade = np.clip(np.arange(N) / (0.02 * SR), 0, 1) * np.clip((N - np.arange(N)) / (2.2 * SR), 0, 1)
mix = np.tanh(mix * fade * 1.15)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write("public/audio/film-score.wav", SR, (mix.T * 32767).astype(np.int16))
print("wrote public/audio/film-score.wav", round(N / SR, 2), "s")
