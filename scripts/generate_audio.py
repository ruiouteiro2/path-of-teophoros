"""Original synthesized game audio. Run with Python + numpy; no external recordings."""
from pathlib import Path
import numpy as np
import wave
RATE=22050
out=Path(__file__).resolve().parents[1]/'assets/audio';out.mkdir(exist_ok=True)
rng=np.random.default_rng(732)
def save(name,x,loop=False):
 x=np.asarray(x,dtype=float)
 if loop:
  # Smooth both boundaries without a click; sparse notes leave a short musical breath.
  n=300;x[:n]*=np.linspace(0,1,n);x[-n:]*=np.linspace(1,0,n)
 x=np.tanh(x)*.82
 with wave.open(str(out/(name+'.wav')),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes((x*32767).astype('<i2').tobytes())
def pluck(freq,duration=2):
 t=np.arange(int(duration*RATE))/RATE
 return sum(np.sin(2*np.pi*freq*k*t)*np.exp(-t*(1.5+k*.9))/k**1.6 for k in range(1,7))*(1-np.exp(-t*160))*.19
beat=60/84;duration=64*beat;music=np.zeros(round(duration*RATE))
def add(dst,sound,at,gain=1):
 a=round(at*RATE);n=min(len(sound),len(dst)-a)
 if n>0:dst[a:a+n]+=sound[:n]*gain
# Four eight-beat phrases, repeated with a higher answering voice.
melody=[64,67,71,69,67,66,64,None,62,66,69,71,74,71,69,None,64,67,71,76,74,71,69,67,66,69,67,64,62,64,None,None]
for i,note in enumerate(melody*2):
 if note is not None:add(music,pluck(440*2**((note-69)/12)),i*beat,.7 if i<32 else .65)
for bar in range(16):
 root=[52,50,55,57][bar%4];add(music,pluck(440*2**((root-69)/12),3),bar*4*beat,.55)
 for j,interval in enumerate([0,7,12]):add(music,pluck(440*2**((root+interval-69)/12),2),bar*4*beat+(j+.5)*beat,.22)
# Gentle room reflections.
for delay,g in [(.13,.18),(.29,.1)]:
 n=int(delay*RATE);music[n:]+=music[:-n].copy()*g
save('olympus-theme',music,True)
# Soft running water: layered filtered noise and tiny irregular bubbling resonances.
n=RATE*12;t=np.arange(n)/RATE;white=rng.normal(0,1,n)
water=np.convolve(white,np.ones(9)/9,mode='same')*.15+np.convolve(white,np.ones(60)/60,mode='same')*.32
for i in range(90):
 at=rng.uniform(0,11.8);tt=np.arange(int(.15*RATE))/RATE;f=rng.uniform(650,1500);bubble=np.sin(2*np.pi*(f*tt-500*tt**2))*np.exp(-tt*35)*.024;add(water,bubble,at)
water*=.8+.12*np.sin(t*1.3);save('stream',water,True)
birds=np.zeros(RATE*14)
for at in [1.2,1.45,4.5,4.8,8.3,8.5,8.8,12.4]:
 tt=np.arange(int(.19*RATE))/RATE;chirp=np.sin(2*np.pi*(2100*tt+1600*tt**2+90*np.sin(tt*25)*tt))*np.sin(np.pi*tt/.19)**2*.11;add(birds,chirp,at)
save('birds',birds,True)
for name,freq in [('wood',180),('stone',1250),('fiber',420)]:
 tt=np.arange(int(.24*RATE))/RATE;noise=rng.normal(0,1,len(tt));x=(np.sin(2*np.pi*freq*tt)*(.14 if name!='fiber' else .02)+noise*.035)*np.exp(-tt*22);save(name,x)
step=rng.normal(0,1,int(.13*RATE));step=np.convolve(step,np.ones(7)/7,mode='same')*np.exp(-np.arange(len(step))/RATE*38)*.17;save('step',step)
pickup=np.zeros(int(.65*RATE))
for i,note in enumerate([76,79,83]):add(pickup,pluck(440*2**((note-69)/12),.4),i*.09,.5)
save('pickup',pickup)
travel=np.zeros(int(1.1*RATE))
for i,note in enumerate([64,71,76]):add(travel,pluck(440*2**((note-69)/12),.8),i*.14,.4)
save('travel',travel)
print('Wrote',len(list(out.glob('*.wav'))),'original audio files')
