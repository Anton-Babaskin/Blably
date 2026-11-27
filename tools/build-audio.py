import json, wave, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from piper import PiperVoice
d='vits-piper-tr_TR-dfki-medium'
v=PiperVoice.load(f'{d}/tr_TR-dfki-medium.onnx',config_path=f'{d}/tr_TR-dfki-medium.onnx.json')
keys=json.load(open('keys.json'))
os.makedirs('wav',exist_ok=True); os.makedirs('mp3',exist_ok=True)
jobs=[]
n=0
for pack,lst in keys.items():
    for i,(k,text) in enumerate(lst):
        t=text if text[-1] in '.?!' else text+'.'
        w=f'wav/{pack}_{i}.wav'
        with wave.open(w,'wb') as f: v.synthesize_wav(t,f)
        jobs.append((w,f'mp3/{pack}_{i}.mp3')); n+=1
print('synth',n)
def enc(j):
    subprocess.run(['ffmpeg','-v','error','-y','-i',j[0],'-af','apad=pad_dur=0.12','-ac','1','-ar','22050','-c:a','libmp3lame','-b:a','24k','-write_xing','0','-id3v2_version','0','-map_metadata','-1',j[1]],check=True)
with ThreadPoolExecutor(4) as ex: list(ex.map(enc,jobs))
index={}
os.makedirs('../audio',exist_ok=True)
tot=0
for pack,lst in keys.items():
    arr=[]
    with open(f'../audio/{pack}.mp3','wb') as out:
        for i,(k,_) in enumerate(lst):
            b=open(f'mp3/{pack}_{i}.mp3','rb').read(); out.write(b); arr.append([k,len(b)])
    index[pack]=arr; tot+=sum(a[1] for a in arr)
open('../audio-index.js','w',encoding='utf8').write('window.AUDIO_INDEX='+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n')
print('bytes',tot)
