"""Original 40-second drum & bass score for the BNBU 伴学 launch film.

Synthesised from scratch (no samples): 180 BPM, A minor, Am-F-C-G (8 beats per chord).
Musical beat b sits at b / 3 s (= frame 10b at 30 fps). The film's 15-frame grid in
src/timeline.ts lands on every third eighth note, and every whole-second cut lands on a beat.
Sections (beats): intro 0-12 (0-4 s), half-time groove 12-28, fill 28-32, drop 32-72
(10.7-24 s), lift 72-104, build 104-108, final hit 108 (36 s), tail to 120 (40 s).
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
def kick(strength=1.0):
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 48 + 190 * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t * 240) * 0.25
    return np.tanh((body + click) * 2.0 * strength) * 0.9


def kick_at(beat, strength=1.0, gain=1.0):
    place(kick(strength), beat, gain, bus="drums")
    KICKS.append((beat * BEAT, gain))


def snare(g=1.0):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * 185 * t) + 0.5 * np.sin(2 * np.pi * 330 * t)) * np.exp(-t * 30) * 0.5
    noise = bp(rng.standard_normal(n), 1200, 9000) * np.exp(-t * 17) * 0.55
    crack = hp(rng.standard_normal(n), 5000) * np.exp(-t * 120) * 0.3
    return np.tanh((tone + noise + crack) * 1.6) * 0.7 * g


def hat(open_=False):
    n = int((0.25 if open_ else 0.045) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t * (13 if open_ else 95)) * 0.2


def crash():
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    return (hp(noise, 4500, 2) * 0.8 + bp(noise, 2500, 7000) * 0.4) * np.exp(-t * 1.6) * 0.22


def impact():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    f = 40 + 100 * np.exp(-t * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3)
    air = lp(rng.standard_normal(n), 3000) * np.exp(-t * 6) * 0.3
    return np.tanh((boom + air) * 1.8) * 0.8


def sub_boom():
    n = int(3.6 * SR)
    t = np.arange(n) / SR
    f = 34 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3)
    air = lp(rng.standard_normal(n), 1800) * np.exp(-t * 3.2) * 0.25
    return np.tanh((boom + air) * 1.8) * 0.95


def riser(beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    k = t / t[-1]
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunk = 2048
    for s in range(0, n, chunk):
        fc = 400 + 8000 * k[s] ** 2
        out[s : s + chunk] = bp(noise[s : s + chunk], fc * 0.6, min(fc * 1.6, SR / 2 - 100), 1)
    sweep = np.sin(2 * np.pi * np.cumsum(220 + 880 * k ** 2) / SR) * 0.15
    return (out * 0.35 + sweep) * k ** 1.6


# ---------------- tonal ----------------
CHORDS = [  # (bass midi, chord tones)
    (45, [57, 60, 64, 69]),  # Am
    (41, [53, 57, 60, 65]),  # F
    (48, [55, 60, 64, 67]),  # C
    (43, [55, 59, 62, 67]),  # G
]


def chord_at(b):
    return CHORDS[(int(b) // 8) % 4]


def pad(chord, beats, cutoff):
    n = int(beats * BEAT * SR)
    sig = np.zeros(n)
    for m in chord:
        sig += saw(note_hz(m), n, 0.006)
    sig = lp(sig, cutoff, 2)
    t = np.arange(n) / SR
    return sig * np.clip(t / 0.25, 0, 1) * np.clip((beats * BEAT - t) / 0.3, 0, 1) * 0.14


def reese(m, beats, rate):
    """Detuned saw bass with a slow filter wobble and a clean sine sub."""
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    f = note_hz(m - 12)
    s = saw(f * 0.994, n) + saw(f * 1.006, n) + 0.5 * saw(f * 2.003, n)
    w = 0.5 - 0.5 * np.cos(2 * np.pi * rate * t)
    growl = lp(s, 260) * (1 - w) + lp(s, 1500) * w
    sub = np.sin(2 * np.pi * f * t) * 0.9
    e = np.clip(t / 0.004, 0, 1) * np.clip((beats * BEAT - t) / 0.012, 0, 1)
    return np.tanh((growl * 0.7 + sub) * 1.5) * 0.45 * e


def pluck(m, length=0.26):
    n = int(length * SR)
    t = np.arange(n) / SR
    return lp(saw(note_hz(m), n, 0.004), 3400) * np.exp(-t * 16) * 0.22


def stab(chord):
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    s = sum(saw(note_hz(m + 12), n, 0.008) for m in chord)
    return lp(s, 2800) * np.exp(-t * 13) * 0.13


def bell(m, length=0.9):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6))
    s += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 8)
    return s * np.exp(-t * 5.5) * 0.22


def chime_hit(m):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4)
    return s * np.exp(-t * 2.6) * 0.18


# ---------------- drums arrangement ----------------
for bar in range(30):
    b = bar * 4
    if b == 0:
        kick_at(0, 0.7, 0.6)
    elif 12 <= b < 28:  # half-time: snare on 3 only
        kick_at(b, 0.9, 0.85)
        kick_at(b + 2.5, 0.8, 0.7)
        place(snare(), b + 2, 0.8, bus="drums")
        for e in range(8):
            place(hat(), b + e * 0.5, 0.5 if e % 2 else 0.3, 0.2, "drums")
    elif b == 28:  # fill into the drop
        kick_at(28, 1.0, 0.9)
        for i in range(4):
            place(snare(0.6), 28 + i * 0.5, 0.3 + i * 0.05, bus="drums")
        for i in range(8):
            place(snare(0.7), 30 + i * 0.25, 0.45 + i * 0.06, bus="drums")
    elif 32 <= b < 104:  # two-step
        kick_at(b, 1.0, 1.0)
        kick_at(b + 2.5, 0.9, 0.85)
        if bar % 2:
            kick_at(b + 1.75, 0.7, 0.45)
        place(snare(), b + 1, 0.95, bus="drums")
        place(snare(), b + 3, 0.95, bus="drums")
        place(snare(0.4), b + 3.75, 0.3, bus="drums")
        for s in range(16):
            place(hat(), b + s * 0.25, [0.5, 0.22, 0.36, 0.22][s % 4], 0.25 if s % 2 else -0.25, "drums")
        place(hat(True), b + 1.5, 0.42, 0.3, "drums")
        if b >= 72:
            place(hat(True), b + 3.5, 0.38, -0.3, "drums")
    elif b == 104:  # snare roll into the final hit
        kick_at(104, 1.0, 0.9)
        kick_at(106, 1.0, 0.8)
        for i in range(8):
            place(snare(0.7), 104 + i * 0.25, 0.4 + i * 0.03, bus="drums")
        for i in range(16):
            place(snare(0.7), 106 + i * 0.125, 0.55 + i * 0.025, bus="drums")

for b in (12, 32, 51, 72, 93):
    place(crash(), b, 0.8 if b != 12 else 0.5, bus="drums")
place(impact(), 32, 0.55, bus="fx")
place(impact(), 72, 0.4, bus="fx")

# ---------------- music arrangement ----------------
for b in range(0, 108, 8):
    _, chord = chord_at(b)
    cutoff = 900 if b < 12 else 1500 if b < 32 else 2200 if b < 72 else 3000
    place(pad(chord, 8, cutoff), b, 0.9 if b < 12 else 0.6)

for bar in range(3, 26):
    b = bar * 4
    if b == 28:
        place(reese(chord_at(b)[0], 2, 0.75), b, 0.7)
        continue
    root = chord_at(b)[0]
    rate = 0.75 if b < 32 else 1.5
    g = 0.7 if b < 32 else 1.0
    place(reese(root, 2.4, rate), b, g)
    place(reese(root + (12 if b >= 32 and bar % 2 else 0), 1.4, rate * 2), b + 2.5, g * 0.9)

ARP = [0, 2, 1, 3, 2, 1, 3, 2]
for b8 in range(40, 208):  # eighth notes, beats 20-104
    b = b8 * 0.5
    if 28 <= b < 32:
        continue
    _, chord = chord_at(b)
    tones = [m + 12 for m in chord]
    place(pluck(tones[ARP[b8 % 8]]), b, 0.55 if b < 32 else 0.8, -0.4 + 0.8 * (b8 % 2))

for bar in range(18, 26):  # off-beat stabs in the lift
    b = bar * 4
    for o in (0.5, 1.5, 3.5):
        place(stab(chord_at(b + o)[1]), b + o, 0.9, 0.15)

# Hook on the film's 15-frame grid (every 1.5 beats), drop at low level, lift in full.
for b in range(48, 104, 8):
    _, chord = chord_at(b)
    line = [chord[3] + 12, chord[2] + 12, chord[1] + 12, chord[2] + 12, chord[3] + 12]
    for i, m in enumerate(line):
        place(bell(m, 0.7), b + i * 1.5, 0.5 if b < 72 else 0.85, -0.2 + 0.1 * i)

# Opening: cards light up every 0.5 s, logo at 2.5 s, riser into the home push at 4 s.
for i, m in enumerate([76, 79, 83, 86]):
    place(chime_hit(m), 1.5 * (i + 1), 0.9, -0.4 + 0.27 * i)
place(chime_hit(88), 7.5, 1.0)
place(riser(4), 8, 0.6, bus="fx")
place(riser(8), 100, 0.95, bus="fx")

# Final hit at beat 108 (36 s).
place(sub_boom(), 108, 1.0, bus="fx")
place(crash(), 108, 1.0, bus="drums")
place(pad(CHORDS[0][1], 12, 1300), 108, 1.4)
place(bell(81, 2.5), 108, 1.0)
place(bell(76, 2.5), 109.5, 0.6, 0.3)
place(bell(69, 2.5), 111, 0.45, -0.3)

# ---------------- master ----------------
t = np.arange(N) / SR
duck = np.ones(N)
for tk, g in KICKS:
    i = int(tk * SR)
    seg = t[i:] - tk
    duck[i:] = np.minimum(duck[i:], 1 - 0.55 * g * np.exp(-seg / 0.09))
mix = BUS["drums"] + BUS["music"] * duck * 0.9 + BUS["fx"]
mix = hp(mix, 28)
fade = np.clip(np.arange(N) / (0.05 * SR), 0, 1) * np.clip((N - np.arange(N)) / (2.2 * SR), 0, 1)
mix = np.tanh(mix * fade * 1.15)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write("public/audio/bgm-original.wav", SR, (mix.T * 32767).astype(np.int16))
print("wrote public/audio/bgm-original.wav", N / SR, "s")
