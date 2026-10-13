"""Synthesised UI sound effects for the launch film (no samples).

ui-click      soft low thock + glassy A/E ping
scroll-long   list flick: dense ticks that slow down over an airy bed (~1.6 s)
scroll-short  short scroll (~0.6 s)
pop-0..5      card pop, rising pitch per card (C D E G A C)
line-run      energy hum and rising shimmer for the pulse line running across (~2.6 s)
zip           fast bright sweep for the line wipe between scenes (~0.7 s)
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def write(name, sig, spread=24):
    sig = np.tanh(sig * 1.2)
    sig /= np.max(np.abs(sig)) / 0.9
    stereo = np.stack([sig, np.concatenate([np.zeros(spread), sig[:-spread]])], 1)
    wavfile.write(f"public/audio/sfx/{name}.wav", SR, (stereo * 32767).astype(np.int16))
    print("wrote", name)


def ui_click():
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    tick = filt(rng.standard_normal(n), "high", 4500, 4) * np.exp(-t * 900) * 0.5
    f = 230 + 160 * np.exp(-t * 90)
    thock = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55) * 0.9
    ping = (np.sin(2 * np.pi * 1760 * t) + 0.55 * np.sin(2 * np.pi * 2637 * t + 0.3)) * np.exp(-t * 22) * 0.32
    ping *= np.clip((t - 0.004) / 0.002, 0, 1)
    write("ui-click", tick + thock + ping)


def tick(n_len=0.03, bright=1.0):
    n = int(n_len * SR)
    t = np.arange(n) / SR
    click = filt(rng.standard_normal(n), "band", [1800, 6500]) * np.exp(-t * 700) * bright
    body = np.sin(2 * np.pi * (900 + rng.uniform(-60, 60)) * t) * np.exp(-t * 260) * 0.35
    return click + body


def scroll(dur, i0, i1, name):
    n = int(dur * SR)
    out = np.zeros(n)
    t, k = 0.012, 0
    while t < dur - 0.05:
        p = t / dur
        g = (1 - p) ** 1.2 * (0.7 + 0.3 * rng.random())
        s = tick(bright=0.6 + 0.4 * (1 - p)) * g
        i = int(t * SR)
        out[i : i + len(s)] += s[: n - i]
        t += i0 + (i1 - i0) * p ** 1.5
        k += 1
    tt = np.arange(n) / SR
    air = filt(rng.standard_normal(n), "band", [600, 3200]) * np.clip(tt / 0.04, 0, 1) * np.exp(-tt * 3.2 / dur) * 0.12
    write(name, out + air)


def pop(freq, name):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = freq * (0.55 + 0.45 * (1 - np.exp(-t * 160)))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16)
    over = np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR) * np.exp(-t * 30) * 0.25
    click = filt(rng.standard_normal(n), "high", 5000, 4) * np.exp(-t * 1200) * 0.3
    write(name, (tone + over) * np.clip(t / 0.002, 0, 1) * 0.8 + click)


def line_run():
    dur = 2.6
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    env = np.clip(t / 0.08, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    f = 110 * 2 ** (k * 1.0)
    hum = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR)) * (0.75 + 0.25 * np.sin(2 * np.pi * 18 * t)) * 0.35
    noise = rng.standard_normal(n)
    sh = np.zeros(n)
    for s in range(0, n, 2048):
        fc = 1500 + 6000 * k[s]
        sh[s : s + 2048] = filt(noise[s : s + 2048], "band", [fc * 0.7, min(fc * 1.4, 20000)], 1)
    crackle = (rng.random(n) > 0.9985) * rng.standard_normal(n) * 1.5
    crackle = filt(crackle, "high", 3000)
    write("line-run", (hum + sh * 0.35 + crackle * 0.3) * env, 40)


def zip_():
    dur = 0.7
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    for s in range(0, n, 1024):
        fc = 800 + 9000 * k[s] ** 1.4
        out[s : s + 1024] = filt(noise[s : s + 1024], "band", [fc * 0.6, min(fc * 1.5, 20000)], 1)
    tone = np.sin(2 * np.pi * np.cumsum(400 + 1800 * k ** 2) / SR) * 0.18
    env = np.sin(np.pi * np.clip(k, 0, 1)) ** 1.5
    write("zip", (out * 0.6 + tone) * env, 60)


ui_click()
scroll(1.6, 0.022, 0.11, "scroll-long")
scroll(0.6, 0.026, 0.085, "scroll-short")
for i, fr in enumerate([523.3, 587.3, 659.3, 784.0, 880.0, 1046.5]):
    pop(fr, f"pop-{i}")
line_run()
zip_()
