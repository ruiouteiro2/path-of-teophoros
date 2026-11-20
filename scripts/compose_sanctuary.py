"""Original sectional score. NumPy + soundfile + imageio-ffmpeg; no sampled music.

Writes a 4m46s lyre/flute/string cue with an introduction, two themes, a sparse
bridge, variations, a return and a quiet ending. This replaces the 46-second demo.
"""
from pathlib import Path
import subprocess
import numpy as np
import soundfile as sf
import imageio_ffmpeg

RATE = 32000
BEAT = 60 / 76
BAR = BEAT * 4
ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.expo' / 'audio-authoring'
WORK.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(20261120)
duration = BAR * 88 + 8
mix = np.zeros((int(duration * RATE), 2), dtype=np.float32)

def hz(note):
    return 440 * 2 ** ((note - 69) / 12)

def lyre(note, length=2.8):
    t = np.arange(int(length * RATE)) / RATE
    f = hz(note)
    # Slightly inharmonic string partials; high partials decay much sooner.
    wave = sum(np.sin(2*np.pi*f*k*(1 + k*k*.000035)*t + .13*k)
               * np.exp(-t*(.8+k*.55)) / k**1.65 for k in range(1, 11))
    attack = 1 - np.exp(-t*250)
    release = np.minimum(1, (length-t)/.15)
    return wave * attack * release * .13

def flute(note, length):
    t = np.arange(int((length+.18)*RATE))/RATE
    vibrato = .0022*np.sin(2*np.pi*5.1*t)*(1-np.exp(-t*3))
    phase = 2*np.pi*np.cumsum(hz(note)*(1+vibrato))/RATE
    tone = np.sin(phase)+.14*np.sin(2*phase)+.045*np.sin(3*phase)
    breath = rng.normal(0, 1, len(t))
    breath = np.convolve(breath, np.ones(7)/7, mode='same')*.022
    envelope = np.minimum(1,t/.09)*np.minimum(1,np.maximum(0,(length+.18-t)/.22))
    return (tone+breath)*envelope*.043

def strings(note, length):
    t = np.arange(int(length*RATE))/RATE
    f=hz(note)
    tone=sum(np.sin(2*np.pi*f*(1+detune)*t+i*.7) for i,detune in enumerate([-.002,0,.002]))/3
    tone+=.12*np.sin(2*np.pi*f*2*t)
    envelope=np.minimum(1,t/.8)*np.minimum(1,(length-t)/1.2)
    return tone*envelope*.021

def place(sound, at, gain=1, pan=0):
    start=max(0,int(at*RATE));n=min(len(sound),len(mix)-start)
    if n<=0:return
    mix[start:start+n,0]+=sound[:n]*gain*np.sqrt((1-pan)/2)
    mix[start:start+n,1]+=sound[:n]*gain*np.sqrt((1+pan)/2)

# D Dorian palette; harmony changes and voicings are authored, not a random walk.
chords=[(50,57,62,65),(48,55,60,64),(43,50,55,59),(45,52,57,60)]
theme_a=[[(62,1),(65,1),(69,2)],[(67,1.5),(65,.5),(64,2)],[(62,2),(None,1),(64,1)],[(65,1),(67,1),(69,2)],
         [(71,1.5),(69,.5),(67,1),(65,1)],[(64,2),(62,1),(60,1)],[(62,3),(None,1)],[(None,4)]]
theme_b=[[(69,2),(72,1),(74,1)],[(76,1.5),(74,.5),(72,2)],[(71,1),(69,1),(67,2)],[(69,3),(None,1)],
         [(67,1),(65,1),(64,1),(62,1)],[(64,2),(67,2)],[(65,1.5),(64,.5),(62,2)],[(None,4)]]
theme_c=[[(65,2),(69,2)],[(67,1),(64,1),(60,2)],[(62,1),(67,1),(71,2)],[(69,2),(64,2)],
         [(62,1),(64,1),(65,1),(69,1)],[(72,2),(71,1),(67,1)],[(69,1),(65,1),(62,2)],[(None,4)]]

for bar in range(88):
    section='intro' if bar<8 else 'a' if bar<24 else 'b' if bar<40 else 'bridge' if bar<48 else 'variation' if bar<64 else 'c' if bar<80 else 'outro'
    chord=chords[(bar//2 + (1 if section=='b' else 0))%4]
    at=bar*BAR
    quiet=section in ['intro','bridge','outro']
    # Changing arpeggiation and spacious endings prevent a mechanical ostinato.
    pattern=[(0,0),(1.5,2),(2.5,1)] if quiet else ([(0,0),(.75,2),(1.5,1),(2.5,3),(3.25,2)] if bar%2==0 else [(0,0),(1,1),(2,3),(3,2)])
    for offset,index in pattern:
        if section=='outro' and bar>84 and offset>0:continue
        place(lyre(chord[index]+12),at+offset*BEAT+rng.uniform(0,.018),rng.uniform(.55,.8),-.22)
    if bar%2==0:
        for note in chord[:3]:place(strings(note,BAR*2),at,.6 if quiet else 1,.15)
        place(lyre(chord[0]-12,4),at,.5,0)
    if quiet:continue
    melody=theme_b if section=='b' else theme_c if section=='c' else theme_a
    phrase=melody[(bar-8)%8]
    offset=0
    for note,beats in phrase:
        if note is not None:
            # The variation exchanges flute and lyre lead and adds a quiet answer.
            voice=lyre(note+12,beats*BEAT+.7) if section=='variation' else flute(note,beats*BEAT*.88)
            place(voice,at+offset*BEAT,.65 if section=='variation' else .85,.18)
            if section=='c' and beats>=2:place(lyre(note-12),at+(offset+1.5)*BEAT,.25,-.3)
        offset+=beats

# Small natural room reflections; preserve clear attacks and avoid a wash of echo.
dry=mix.copy()
for delay,gain in [(.071,.13),(.139,.08),(.227,.045)]:
    n=int(delay*RATE);mix[n:]+=dry[:-n,::-1]*gain
fade=int(RATE*3);mix[:fade]*=np.linspace(0,1,fade)[:,None];mix[-RATE*7:]*=np.linspace(1,0,RATE*7)[:,None]
peak=float(np.max(np.abs(mix)))
if peak>.68:mix*=.68/peak
wav=WORK/'sanctuary-dawn.wav';sf.write(wav,mix,RATE,subtype='PCM_16')
target=ROOT/'assets/audio/sanctuary-dawn.m4a'
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(wav),'-c:a','aac','-b:a','128k',str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(f'{target.name}: {duration:.1f}s, peak={np.max(np.abs(mix)):.3f}, rms={np.sqrt(np.mean(mix**2)):.4f}, bytes={target.stat().st_size}')
