"""Original 40-second score for the BNBU 伴学 launch film: light, rhythmic, not heavy.

Synthesised from scratch (no samples): 180 BPM with a mostly half-time feel, C major,
Fmaj7-G-Em7-Am7 (8 beats per chord). Soft kick, rim/clap backbeat, shaker sixteenths,
round sine bass, marimba-like plucks and airy pads.
Musical beat b sits at b / 3 s (= frame 10b at 30 fps). The film's 15-frame grid in
src/timeline.ts lands on every third eighth note, and every whole-second cut lands on a beat.
Sections (beats): intro 0-12 (0-4 s), groove 12-32, full 32-72 (10.7-24 s), lift 72-104,
build 104-108, final chord 108 (36 s), tail to 120 (40 s).
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
BPM = 180
BEAT = 60 / BPM
DUR = 40.0
N = int(SR * DUR)
rng = np.random.default_rng(20261013)
BUS = {k: np.zeros((2, N)) for k in ("drums", "music", "fx")}
KICKS = []


def place(sig, beat, gain=1.0, pan=0.0, bus="music"):
    i = int(round(beat * BEAT * SR))
    if i < 0 or i >= N:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    a = (pan + 1) * np.pi / 4
    BUS[bus][0, i:j] += s * np.cos(a) * np.sqrt(2)
    BUS[bus][1, i:j] += s * np.sin(a) * np.sqrt(2)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def note_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune):
        ph = (t * freq * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / 3


# ---------------- drums ----------------
def kick():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 52 + 90 * np.exp(-t * 45)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
    click = lp(rng.standard_normal(n), 2500) * np.exp(-t * 300) * 0.08
    return np.tanh((body + click) * 1.1) * 0.75


def kick_at(beat, gain=1.0):
    place(kick(), beat, gain, bus="drums")
    KICKS.append((beat * BEAT, gain))


def rim():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 820 * t) * np.exp(-t * 60) * 0.35
    noise = bp(rng.standard_normal(n), 1800, 6000) * np.exp(-t * 55) * 0.35
    return (tone + noise) * 0.6


def clap():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1000, 6000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.018]):
        e += np.exp(-np.clip(t - off, 0, None) * (240 if k < 2 else 30)) * (t >= off)
    return noise * e * 0.28


def shaker(g=1.0):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    e = np.clip(t / 0.006, 0, 1) * np.exp(-t * 70)
    return bp(rng.standard_normal(n), 5000, 12000) * e * 0.14 * g


def hat_open():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t * 18) * 0.1


def cymbal():
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 6000, 2) * np.clip(t / 0.01, 0, 1) * np.exp(-t * 2) * 0.1


def swell(beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    k = t / t[-1]
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunk = 2048
    for s in range(0, n, chunk):
        fc = 600 + 5000 * k[s] ** 2
        out[s : s + chunk] = bp(noise[s : s + chunk], fc * 0.7, min(fc * 1.4, SR / 2 - 100), 1)
    return out * 0.18 * k ** 2


# ---------------- tonal ----------------
CHORDS = [  # (bass midi, chord tones)
    (41, [53, 57, 60, 64]),  # Fmaj7
    (43, [55, 59, 62, 67]),  # G
    (40, [55, 59, 62, 64]),  # Em7
    (45, [55, 60, 64, 67]),  # Am7
]
FINAL = (48, [55, 60, 64, 71])  # Cmaj7


def chord_at(b):
    return CHORDS[(int(b) // 8) % 4]


def pad(chord, beats, cutoff):
    n = int(beats * BEAT * SR)
    sig = np.zeros(n)
    for m in chord:
        sig += saw(note_hz(m), n, 0.005)
    sig = lp(sig, cutoff, 2)
    t = np.arange(n) / SR
    return sig * np.clip(t / 0.4, 0, 1) * np.clip((beats * BEAT - t) / 0.4, 0, 1) * 0.12


def bass(m, beats):
    """Round sine bass with a little warmth, plucked envelope."""
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    f = note_hz(m - 12)
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t)
    e = np.clip(t / 0.006, 0, 1) * (0.35 + 0.65 * np.exp(-t * 3.5)) * np.clip((beats * BEAT - t) / 0.03, 0, 1)
    return np.tanh(s * 1.2) * e * 0.42


def marimba(m, length=0.4):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 40)
    return s * np.clip(t / 0.002, 0, 1) * np.exp(-t * 11) * 0.2


def bell(m, length=0.9):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t + 0.5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6))
    return s * np.exp(-t * 4.5) * 0.17


def chime_hit(m):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4)
    return s * np.exp(-t * 2.6) * 0.18


# ---------------- drums arrangement ----------------
for bar in range(30):
    b = bar * 4
    if 12 <= b < 32:  # half-time groove: backbeat on 3
        kick_at(b, 0.8)
        kick_at(b + 2.5, 0.55)
        place(clap(), b + 2, 0.7, bus="drums")
        for s in range(16):
            place(shaker(), b + s * 0.25, [0.35, 0.15, 0.6, 0.15][s % 4], 0.3, "drums")
        if b >= 24:
            place(rim(), b + 3.5, 0.5, -0.3, "drums")
    elif 32 <= b < 104:  # lighter two-step: rim on 2, clap on 4
        kick_at(b, 0.9)
        kick_at(b + 2.5, 0.65)
        place(rim(), b + 1, 0.75, -0.25, "drums")
        place(clap(), b + 3, 0.8, bus="drums")
        if bar % 2:
            place(rim(), b + 3.75, 0.35, 0.25, "drums")
        for s in range(16):
            place(shaker(), b + s * 0.25, [0.4, 0.15, 0.65, 0.18][s % 4], 0.3 if s % 2 else -0.15, "drums")
        if b >= 72:
            place(hat_open(), b + 1.5, 0.8, 0.3, "drums")
            place(hat_open(), b + 3.5, 0.7, -0.3, "drums")
    elif b == 104:  # gentle lift into the final chord
        kick_at(104, 0.7)
        for i in range(8):
            place(rim(), 104 + i * 0.5, 0.3 + i * 0.05, 0.2 * (-1) ** i, "drums")
        for i in range(8):
            place(shaker(), 106 + i * 0.25, 0.4 + i * 0.07, 0.2, "drums")

for b in (32, 72):
    place(cymbal(), b, 0.8, bus="drums")

# ---------------- music arrangement ----------------
for b in range(0, 108, 8):
    _, chord = chord_at(b)
    cutoff = 1000 if b < 12 else 1600 if b < 32 else 2200 if b < 72 else 2600
    place(pad(chord, 8, cutoff), b, 1.0 if b < 12 else 0.75)

for bar in range(3, 26):
    b = bar * 4
    root = chord_at(b)[0]
    g = 0.75 if b < 32 else 1.0
    place(bass(root, 2.4), b, g)
    place(bass(root + (7 if b >= 32 and bar % 2 else 0), 1.4), b + 2.5, g * 0.8)

ARP = [0, 2, 1, 3, 2, 1, 3, 2]
for b8 in range(24, 208):  # eighth notes, beats 12-104
    b = b8 * 0.5
    _, chord = chord_at(b)
    tones = [m + 12 for m in chord]
    gain = 0.45 if b < 20 else 0.65 if b < 32 else 0.8
    place(marimba(tones[ARP[b8 % 8]]), b, gain * (1.0 if b8 % 2 == 0 else 0.7), -0.45 + 0.9 * (b8 % 2))

# Hook on the film's 15-frame grid (every 1.5 beats).
for b in range(32, 104, 8):
    _, chord = chord_at(b)
    line = [chord[3] + 12, chord[2] + 12, chord[1] + 12, chord[2] + 12, chord[3] + 12]
    for i, m in enumerate(line):
        place(bell(m, 0.8), b + i * 1.5, 0.45 if b < 72 else 0.7, -0.2 + 0.1 * i)

# Opening: cards light up every 0.5 s, logo at 2.5 s, soft swell into the home push at 4 s.
for i, m in enumerate([72, 76, 79, 84]):
    place(chime_hit(m), 1.5 * (i + 1), 0.9, -0.4 + 0.27 * i)
place(chime_hit(88), 7.5, 1.0)
place(swell(4), 8, 0.7, bus="fx")
place(swell(6), 102, 0.9, bus="fx")

# Final chord at beat 108 (36 s).
kick_at(108, 0.8)
place(cymbal(), 108, 1.0, bus="drums")
place(bass(FINAL[0], 10), 108, 0.9)
place(pad(FINAL[1], 12, 1800), 108, 1.4)
for i, m in enumerate([79, 84, 88, 91]):
    place(bell(m, 2.5), 108 + i * 0.5, 0.75 - i * 0.1, -0.3 + 0.2 * i)

# ---------------- master ----------------
t = np.arange(N) / SR
duck = np.ones(N)
for tk, g in KICKS:
    i = int(tk * SR)
    duck[i:] = np.minimum(duck[i:], 1 - 0.25 * g * np.exp(-(t[i:] - tk) / 0.08))
mix = BUS["drums"] * 0.85 + BUS["music"] * duck + BUS["fx"]
mix = hp(mix, 30)
fade = np.clip(np.arange(N) / (0.05 * SR), 0, 1) * np.clip((N - np.arange(N)) / (2.2 * SR), 0, 1)
mix = np.tanh(mix * fade)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write("public/audio/bgm-original.wav", SR, (mix.T * 32767).astype(np.int16))
print("wrote public/audio/bgm-original.wav", N / SR, "s")
