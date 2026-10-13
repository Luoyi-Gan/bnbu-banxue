"""UI click for the launch film: soft low thock + glassy A/E ping in the score's key."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
n = int(0.32 * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(7)

tick = sosfilt(butter(4, 4500, "high", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t * 900) * 0.5
f = 230 + 160 * np.exp(-t * 90)
thock = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55) * 0.9
ping = (np.sin(2 * np.pi * 1760 * t) + 0.55 * np.sin(2 * np.pi * 2637 * t + 0.3)) * np.exp(-t * 22) * 0.32
ping *= np.clip((t - 0.004) / 0.002, 0, 1)
sig = np.tanh((tick + thock + ping) * 1.3)
sig /= np.max(np.abs(sig)) / 0.9
stereo = np.stack([sig, np.concatenate([np.zeros(24), sig[:-24]])], 1)
wavfile.write("public/audio/sfx/ui-click.wav", SR, (stereo * 32767).astype(np.int16))
print("wrote public/audio/sfx/ui-click.wav")
