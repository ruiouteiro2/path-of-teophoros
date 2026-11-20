"""Prepare licensed field/foley sources. See assets/audio/foley/README.md.

Usage: python scripts/prepare_foley.py
The two Kenney packs must be extracted beneath assets/audio, and the
OpenGameArt downloads must be present in the user's Downloads directory.
"""
from pathlib import Path
import subprocess
import imageio_ffmpeg
import soundfile as sf
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/audio/foley'
OUT.mkdir(exist_ok=True)
selected={
    'coins':'kenney-rpg/Audio/handleCoins.ogg',
    'door':'kenney-rpg/Audio/doorOpen_1.ogg',
    'fiber-pickup':'kenney-rpg/Audio/cloth1.ogg',
    'wood-pickup':'kenney-impact/Audio/impactWood_light_001.ogg',
    'stone-pickup':'kenney-impact/Audio/impactMining_001.ogg',
}
for family,material in [('floor','wood'),('grass','grass'),('stone','concrete')]:
    for i in range(4):
        selected[f'{family}-{i}']=f'kenney-impact/Audio/footstep_{material}_{i:03}.ogg'
def clean_transient(data, rate):
    """Remove the measured tail offset; keep the impact and audible decay."""
    stereo = data.ndim == 2
    signal = data if stereo else data[:, None]
    signal = signal - signal[-min(len(signal), int(rate*.025)):].mean(axis=0)
    block = max(1, int(rate*.01))
    envelope = np.array([np.sqrt(np.mean(signal[i:i+block]**2)) for i in range(0,len(signal),block)])
    active = np.flatnonzero(envelope > max(.0005, envelope.max()*.008))
    if len(active):
        end = min(len(signal), (int(active[-1])+1)*block+int(rate*.035))
        signal = signal[:end].copy()
    attack,release=min(len(signal),int(rate*.002)),min(len(signal),int(rate*.018))
    signal[:attack] *= np.linspace(0,1,attack)[:,None]
    signal[-release:] *= np.linspace(1,0,release)[:,None]
    peak=np.max(np.abs(signal))
    if peak>.88:signal*=.88/peak
    return signal if stereo else signal[:,0]

for name,relative in selected.items():
    source=ROOT/'assets/audio'/relative
    if source.exists():
        data,rate=sf.read(source)
        if name.startswith(('floor-','grass-','stone-')) or name=='wood-pickup':
            data=clean_transient(data,rate)
        sf.write(OUT/f'{name}.wav',data,rate,subtype='PCM_16')

soil=ROOT/'assets/audio/kenney-impact/Audio/footstep_grass_001.ogg'
if soil.exists():
    data,rate=sf.read(soil)
    sf.write(OUT/'soil-work.wav',clean_transient(data,rate),rate,subtype='PCM_16')

source=Path.home()/'Downloads/VistulaShort.mp3'
if source.exists():
    # A long field recording, restrained and softened, not generated white noise.
    # Two-second fades avoid abrupt starts if a platform recreates a player.
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(source),
        '-af','highpass=f=100,lowpass=f=5500,volume=0.45,afade=t=in:d=2,afade=t=out:st=298:d=2',
        '-t','300','-ac','2','-ar','32000','-c:a','aac','-b:a','96k',
        str(ROOT/'assets/audio/lakeshore.m4a')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
source=Path.home()/'Downloads/waterflow.mp3'
if source.exists():
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(source),
        '-af','highpass=f=130,lowpass=f=4800,volume=0.4,afade=t=in:d=0.1,afade=t=out:st=5.4:d=0.25',
        '-ac','2','-ar','32000',str(OUT/'stream-field.wav')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-ss','1.3','-i',str(source),'-t','0.65',
        '-af','highpass=f=180,lowpass=f=4500,volume=0.35,afade=t=in:d=0.04,afade=t=out:st=0.4:d=0.25',
        '-ac','2','-ar','32000',str(OUT/'water-action.wav')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print('Prepared wood-floor footsteps, lakeshore ambience and stream field sample.')
