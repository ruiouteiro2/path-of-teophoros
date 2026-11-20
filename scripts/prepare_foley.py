"""Prepare licensed field/foley sources. See assets/audio/foley/README.md.

Usage: python scripts/prepare_foley.py
The two Kenney packs must be extracted beneath assets/audio, and the
OpenGameArt downloads must be present in the user's Downloads directory.
"""
from pathlib import Path
import subprocess
import imageio_ffmpeg
import soundfile as sf

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
for name,relative in selected.items():
    source=ROOT/'assets/audio'/relative
    if source.exists():
        data,rate=sf.read(source)
        sf.write(OUT/f'{name}.wav',data,rate,subtype='PCM_16')

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
print('Prepared wood-floor footsteps, lakeshore ambience and stream field sample.')
