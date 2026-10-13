"""Original 56-second score for the BNBU 伴学 launch film, modelled on the reference recording's
musical shape (not its melody): ~120 BPM, A minor, a dotted-eighth synth pulse that builds without
a kick, a near-silent breath before the drop, then four-on-floor with sixteenth hats, a pumping
chord bed and a bass line moving Am-C-Am-G / Am-C-E-F every two beats; the kick leaves for the
outro and the pulse returns.

Synthesised from scratch (no samples). The film plays its 120 BPM story grid 1.4x slower
(src/lib/time.ts), so the score runs at 120 / 1.4 ≈ 85.7 BPM: beat n sits at n * 0.7 s (= frame 21n).
Sections (beats): intro 0-4, pulse build 4-16, riser 16-19, breath 19-20, drop 20-66
(14-46 s; hook from 36), breakdown 66-72, final hit 72 (50.4 s), pulse tail to 80 (56 s).
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
BPM = 120 / 1.4
BEAT = 60 / BPM
DUR = 56.0
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
    return sosfilt(butter(order, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], "band", fs=SR, output="sos"), x)


def note_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(freq, n, detune=0.0, voices=3):
    t = np.arange(n) / SR
    out = np.zeros(n)
    ds = np.linspace(-detune, detune, voices) if voices > 1 else [0.0]
    for k, d in enumerate(ds):
        ph = (t * freq * (1 + d) + k * 0.37) % 1.0
        out += 2 * ph - 1
    return out / voices


# ---------------- drums ----------------
def kick():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    f = 50 + 120 * np.exp(-t * 40)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t * 260) * 0.12
    return np.tanh((body + click) * 1.4) * 0.8


def kick_at(beat, gain=1.0):
    place(kick(), beat, gain, bus="drums")
    KICKS.append((beat * BEAT, gain))


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 6500)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.01, 0.02]):
        e += np.exp(-np.clip(t - off, 0, None) * (220 if k < 2 else 24)) * (t >= off)
    return noise * e * 0.34


def hat(open_=False):
    n = int((0.2 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t * (16 if open_ else 80)) * (0.22 if open_ else 0.2)


def snare_roll_hit():
    n = int(0.15 * SR)
    t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t * 35) * 0.3


def riser(beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    k = t / t[-1]
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunk = 2048
    for s in range(0, n, chunk):
        fc = 500 + 7000 * k[s] ** 2
        out[s : s + chunk] = bp(noise[s : s + chunk], fc * 0.6, fc * 1.5, 1)
    sweep = np.sin(2 * np.pi * np.cumsum(330 + 660 * k ** 2) / SR) * 0.08
    return (out * 0.28 + sweep) * k ** 1.8


def cymbal():
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 5000, 2) * np.exp(-t * 1.8) * 0.13


def sub_boom():
    n = int(3.2 * SR)
    t = np.arange(n) / SR
    f = 36 + 60 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5)
    return np.tanh(boom * 1.4) * 0.7


# ---------------- harmony ----------------
# Two beats per chord, eight-chord cycle: Am C Am G | Am C E F.
CYCLE = [
    (33, [57, 60, 64]),  # Am
    (36, [55, 60, 64]),  # C
    (33, [57, 60, 64]),  # Am
    (31, [55, 59, 62]),  # G
    (33, [57, 60, 64]),  # Am
    (36, [55, 60, 64]),  # C
    (32, [56, 59, 64]),  # E/G#
    (29, [57, 60, 65]),  # F
]
DROP = 20


def chord_at(b):
    return CYCLE[(int(b - DROP) // 2) % 8]


def pulse(m, cutoff, length=0.3):
    """Dotted-eighth synth pulse: detuned saw through a low-pass, plucked."""
    n = int(length * SR)
    t = np.arange(n) / SR
    s = saw(note_hz(m), n, 0.006) + 0.5 * np.sin(2 * np.pi * note_hz(m) * t)
    return lp(s, cutoff) * np.clip(t / 0.003, 0, 1) * np.exp(-t * 9) * 0.3


def sub(m, beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * note_hz(m) * t)
    return s * np.clip(t / 0.01, 0, 1) * np.clip((beats * BEAT - t) / 0.02, 0, 1) * 0.42


def chords(tones, beats, cutoff):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    s = sum(saw(note_hz(m), n, 0.012, 5) for m in tones) + sum(saw(note_hz(m + 12), n, 0.012, 3) * 0.4 for m in tones)
    return lp(s, cutoff) * np.clip(t / 0.01, 0, 1) * np.clip((beats * BEAT - t) / 0.03, 0, 1) * 0.11


def lead(m, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = saw(f, n, 0.004) * 0.6 + np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 5))
    return lp(s, 3800) * np.clip(t / 0.004, 0, 1) * np.exp(-t * 4.5) * 0.17


def bell(m, length=1.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t + 0.7 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6))
    return s * np.exp(-t * 4.5) * 0.18


def chime_hit(m):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4)
    return s * np.exp(-t * 2.6) * 0.16


# ---------------- pulse (dotted eighths) ----------------
def pulse_run(b0, b1, cutoff0, cutoff1, gain, follow=False):
    b = b0
    while b < b1 - 1e-6:
        k = (b - b0) / max(1e-6, b1 - b0)
        m = (chord_at(b)[0] + 24) if follow else 45
        place(pulse(m, cutoff0 + (cutoff1 - cutoff0) * k), b, gain, 0.0)
        place(pulse(m + 12, cutoff0 + (cutoff1 - cutoff0) * k, 0.2), b + 0.25 * 0, gain * 0.3, 0.35)
        b += 0.75


pulse_run(0, 16, 900, 3000, 5.0)
pulse_run(16, 19, 3000, 5200, 5.2)
pulse_run(20, 66, 3200, 3200, 0.9, follow=True)
pulse_run(66, 72, 2000, 3600, 4.5)
pulse_run(72, 80, 2000, 700, 3.4)

# Intro sub under the pulse, like the reference's first two seconds.
place(sub(33, 4), 0, 0.6)

# ---------------- build percussion ----------------
for b in range(8, 16):
    place(hat(), b + 0.5, 0.6, 0.2, "drums")
for b in range(12, 16):
    if b % 2:
        place(clap(), b, 0.45, bus="drums")
for i in range(6):
    place(snare_roll_hit(), 16 + i * 0.5, 0.35 + i * 0.05, bus="drums")
for i in range(4):
    place(snare_roll_hit(), 18 + i * 0.25, 0.6 + i * 0.08, bus="drums")
place(riser(3), 16, 0.8, bus="fx")

# ---------------- drop ----------------
for b in range(DROP, 66):
    kick_at(b, 1.0 if b % 2 == 0 else 0.9)
    if b % 2:
        place(clap(), b, 0.8, bus="drums")
    place(hat(True), b + 0.5, 0.75, 0.25, "drums")
    for s in range(4):
        place(hat(), b + s * 0.25, [0.5, 0.3, 0.0, 0.3][s], -0.25, "drums")
    if b >= 48 and b % 4 == 3:
        place(hat(), b + 0.75, 0.6, 0.3, "drums")
for b in (DROP, 36, 48):
    place(cymbal(), b, 0.9, bus="drums")
for i in range(4):  # small fill into the hook
    place(snare_roll_hit(), 35 + i * 0.25, 0.3 + i * 0.07, bus="drums")

for b in range(DROP, 66, 2):
    root, tones = chord_at(b)
    place(sub(root, 2), b, 0.6)
    place(chords(tones, 2, 3000 if b < 36 else 4200), b, 1.5)

# Hook from beat 36 (18 s): original line on A minor, dotted rhythm, sits on the chord cycle.
HOOK = [
    (0, 76, 0.75), (0.75, 74, 0.75), (1.5, 72, 0.5), (2, 69, 1.0), (3, 72, 0.5), (3.5, 74, 0.5),
    (4, 76, 0.75), (4.75, 79, 0.75), (5.5, 76, 0.5), (6, 74, 2.0),
    (8, 76, 0.75), (8.75, 74, 0.75), (9.5, 72, 0.5), (10, 69, 1.0), (11, 67, 0.5), (11.5, 69, 0.5),
    (12, 71, 1.0), (13, 68, 1.0), (14, 69, 2.0),
]
for start in (36, 52):
    for off, m, ln in HOOK:
        if start + off < 66:
            place(lead(m, ln * BEAT + 0.15), start + off, 0.9 if start == 36 else 1.0, 0.1)
            if start == 52:
                place(lead(m + 12, ln * BEAT + 0.1), start + off, 0.25, -0.3)

# Sparkle arp from beat 48 (24 s) on chord tones, sixteenths.
for s16 in range(48 * 4, 66 * 4):
    b = s16 / 4
    tones = chord_at(b)[1]
    m = tones[[0, 1, 2, 1][s16 % 4]] + 24
    place(bell(m, 0.25), b, 0.28, -0.5 + (s16 % 4) * 0.33)

# ---------------- opening chimes, breakdown, final hit ----------------
for i, m in enumerate([69, 72, 76, 79, 81, 84]):  # six module fragments, every eighth from 0.25 s
    place(chime_hit(m), 0.5 + i * 0.5, 0.8, -0.45 + 0.18 * i)
place(chime_hit(88), 5, 1.0)

place(chords([57, 60, 64], 2, 1400), 66, 0.7)
place(chords([57, 60, 65], 2, 1600), 68, 0.7)
place(chords([55, 59, 62], 2, 1900), 70, 0.7)
place(riser(6), 66, 0.85, bus="fx")

kick_at(72, 1.0)
place(sub_boom(), 72, 0.9, bus="fx")
place(cymbal(), 72, 1.1, bus="drums")
place(sub(33, 6), 72, 0.8)
place(chords([57, 60, 64, 69], 8, 1800), 72, 1.0)
for i, m in enumerate([81, 76, 72, 69]):
    place(bell(m, 2.4), 72 + i * 0.75, 0.75 - i * 0.12, -0.3 + 0.2 * i)

# ---------------- master ----------------
t = np.arange(N) / SR
duck = np.ones(N)
for tk, g in KICKS:
    i = int(tk * SR)
    seg = t[i:] - tk
    duck[i:] = np.minimum(duck[i:], 1 - 0.6 * g * np.exp(-seg / 0.11))
mix = BUS["drums"] * 0.9 + BUS["music"] * duck + BUS["fx"]
mix = hp(mix, 28)
fade = np.clip(np.arange(N) / (0.03 * SR), 0, 1) * np.clip((N - np.arange(N)) / (2.5 * SR), 0, 1)
mix = np.tanh(mix * fade * 1.1)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write("public/audio/bgm-original.wav", SR, (mix.T * 32767).astype(np.int16))
print("wrote public/audio/bgm-original.wav", N / SR, "s")
