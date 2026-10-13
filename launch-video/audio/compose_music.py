"""Original 40-second electronic score for the BNBU 伴学 launch film.

Synthesised from scratch (no samples): 120 BPM, A minor, i-VI-III-VII.
Beat n sits at n * 0.5 s (= frame 15n at 30 fps), matching src/timeline.ts.
Sections: intro 0-8 beats, groove 8-20, full 20-48, lift 48-62, drive 62-70,
riser 70-72, final hit at beat 72 (36 s), tail to 40 s.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
BPM = 120
BEAT = 60 / BPM
DUR = 40.0
N = int(SR * DUR)
rng = np.random.default_rng(20261013)
L = np.zeros(N)
R = np.zeros(N)


def t_of(beat):
    return beat * BEAT


def place(sig, beat, gain=1.0, pan=0.0):
    i = int(round(t_of(beat) * SR))
    if i >= N:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2) * np.sqrt(2) * 0.7071 * 1.414
    R[i:j] += s * np.sqrt((1 + pan) / 2) * np.sqrt(2) * 0.7071 * 1.414


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def env(n, a, d, sustain=0.0, release=None):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), sustain + (1 - sustain) * np.exp(-(t - a) / max(d, 1e-4)))
    return e


def note_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------- drums ----------------
def kick(strength=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t * 180) * 0.18
    return np.tanh((body + click) * 1.6 * strength) * 0.9


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 5200)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        e += np.exp(-np.clip(t - off, 0, None) * (220 if k < 2 else 26)) * (t >= off)
    return noise * e * 0.45


def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    noise = hp(rng.standard_normal(n), 7500, 4)
    return noise * np.exp(-t * (14 if open_ else 70)) * 0.22


def sub_boom():
    n = int(3.6 * SR)
    t = np.arange(n) / SR
    f = 34 + 70 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t * 1.3)
    air = lp(rng.standard_normal(n), 1800) * np.exp(-t * 3.2) * 0.25
    return np.tanh((boom + air) * 1.8) * 0.95


# ---------------- tonal ----------------
CHORDS = [  # (bass midi, chord tones) per bar of 4 beats
    (45, [57, 60, 64, 69]),  # Am
    (41, [53, 57, 60, 65]),  # F
    (48, [55, 60, 64, 67]),  # C
    (43, [55, 59, 62, 67]),  # G
]


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune):
        ph = (t * freq * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / 3


def pad(chord, beats, cutoff):
    n = int(beats * BEAT * SR)
    sig = np.zeros(n)
    for m in chord:
        sig += saw(note_hz(m), n, 0.006)
    sig = lp(sig, cutoff, 2)
    t = np.arange(n) / SR
    a = np.clip(t / 0.35, 0, 1) * np.clip((beats * BEAT - t) / 0.4, 0, 1)
    return sig * a * 0.16


def bass_note(m, beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    s = saw(note_hz(m), n, 0.003) * 0.6 + np.sin(2 * np.pi * note_hz(m) * t) * 0.7
    s = lp(s, 380, 2)
    e = np.clip(t / 0.005, 0, 1) * np.exp(-t * 2.2) * 0.85 + 0.15
    e *= np.clip((beats * BEAT - t) / 0.02, 0, 1)
    return np.tanh(s * e * 1.4) * 0.5


def bell(m, length=0.9):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6))
    s += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 8)
    return s * np.exp(-t * 5.5) * 0.22


def chime_hit(m):
    """Soft glassy tone used when UI cards light up in the opening."""
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4)
    return s * np.exp(-t * 2.6) * 0.18


def riser(beats):
    n = int(beats * BEAT * SR)
    t = np.arange(n) / SR
    k = t / t[-1]
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunk = 2048
    for s in range(0, n, chunk):
        fc = 400 + 7000 * k[s] ** 2
        seg = noise[s : s + chunk]
        out[s : s + chunk] = bp(seg, fc * 0.6, min(fc * 1.6, SR / 2 - 100), 1)
    sweep = np.sin(2 * np.pi * np.cumsum(220 + 660 * k ** 2) / SR) * 0.15
    return (out * 0.35 + sweep) * k ** 1.6


# ---------------- arrangement ----------------
TOTAL_BEATS = 80
for b in range(TOTAL_BEATS):
    bar = b // 4
    pos = b % 4
    # Kick: four-on-floor from beat 8 to 70, sparse in intro.
    if 8 <= b < 70 or (b < 8 and pos == 0):
        place(kick(0.75 if b < 8 else 1.0), b, 0.95 if b >= 8 else 0.6)
    if 20 <= b < 70 and pos in (1, 3):
        place(clap(), b, 0.9 if b >= 48 else 0.7)
    if 8 <= b < 70:
        place(hat(), b + 0.5, 0.9, 0.25)
        if b >= 20:
            place(hat(), b + 0.25, 0.35, -0.3)
            place(hat(), b + 0.75, 0.35, -0.3)
        if b >= 48 and pos == 3:
            place(hat(True), b + 0.5, 0.6, 0.2)

# Pads every bar (2 s) from the start; brighter as the film opens up.
for bar in range(18):
    b = bar * 4
    bass, chord = CHORDS[bar % 4]
    cutoff = 900 if b < 8 else 1600 if b < 20 else 2400 if b < 48 else 3200
    place(pad(chord, 4, cutoff), b, 1.0 if b >= 8 else 0.8)
    if 8 <= b < 70:
        # Sidechained-feel bass: eighth notes, ducked by note envelope.
        for e in range(8):
            place(bass_note(bass + (12 if e in (3, 7) and b >= 20 else 0), 0.48), b + e * 0.5, 0.9)

# Arpeggio (bell) from beat 20, sixteenth-ish pattern on chord tones.
for bar in range(5, 18):
    b = bar * 4
    if b >= 70:
        break
    _, chord = CHORDS[bar % 4]
    tones = [chord[0] + 12, chord[2] + 12, chord[1] + 12, chord[3] + 12]
    for s in range(8):
        place(bell(tones[s % 4], 0.6), b + s * 0.5, 0.75 if b < 48 else 0.95, -0.35 + 0.7 * (s % 2))

# Opening: card light-ups on beats 1-4, logo on beat 5.
for i, m in enumerate([76, 79, 83, 86]):
    place(chime_hit(m), 1 + i, 0.9, -0.4 + 0.27 * i)
place(chime_hit(88), 5, 1.0)

# Riser into the final hit (beats 66-72) and the hit itself at beat 72.
place(riser(6), 66, 0.9)
place(sub_boom(), 72, 1.0)
place(pad(CHORDS[0][1], 8, 1200), 72, 1.1)
place(bell(81, 2.5), 72, 1.0)
place(bell(76, 2.5), 72.5, 0.6, 0.3)

# ---------------- master ----------------
mix = np.stack([L, R], 1)
mix = hp(mix.T, 28).T
fade_in = np.clip(np.arange(N) / (0.05 * SR), 0, 1)
fade_out = np.clip((N - np.arange(N)) / (2.2 * SR), 0, 1)
mix *= (fade_in * fade_out)[:, None]
mix = np.tanh(mix * 1.15)
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write("public/audio/bgm-original.wav", SR, (mix * 32767).astype(np.int16))
print("wrote public/audio/bgm-original.wav", mix.shape[0] / SR, "s")
