"""Record every phrase from tools/keys.json with a Piper voice and pack the clips.

Usage:
  pip install piper-tts
  # download the voice (two files: .onnx and .onnx.json) into tools/voices/
  node tools/list-phrases.js [lang]          # default: tr
  python3 tools/build-audio.py [path/to/voice.onnx]

keys.json says which language it is ({lang, packs}). Writes audio/<lang>/<pack>.mp3
(24 kbps CBR mono, clips back to back) and audio/<lang>/index.json, which maps
pack -> [[phrase, byteLength], ...] in file order. ui/audio.js cuts a clip by byte range.
Needs ffmpeg with libmp3lame.
"""
import json, os, subprocess, sys, tempfile, wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from piper import PiperVoice

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
model = Path(sys.argv[1]) if len(sys.argv) > 1 else TOOLS / 'voices' / 'tr_TR-dfki-medium.onnx'
voice = PiperVoice.load(str(model), config_path=str(model) + '.json')
spec = json.loads((TOOLS / 'keys.json').read_text(encoding='utf8'))
lang, keys = spec['lang'], spec['packs']
OUT = ROOT / 'audio' / lang
tmp = Path(tempfile.mkdtemp(prefix='settlingo-audio-'))

jobs = []
for pack, items in keys.items():
    for i, (_key, text) in enumerate(items):
        spoken = text if text[-1] in '.?!' else text + '.'   # a final stop gives a natural falling tone
        wav = tmp / f'{pack}_{i}.wav'
        with wave.open(str(wav), 'wb') as f:
            voice.synthesize_wav(spoken, f)
        jobs.append((wav, tmp / f'{pack}_{i}.mp3'))
print('recorded', len(jobs), 'clips')

def encode(job):
    src, dst = job
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', 'apad=pad_dur=0.12',
                    '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '24k',
                    '-write_xing', '0', '-id3v2_version', '0', '-map_metadata', '-1', str(dst)], check=True)

with ThreadPoolExecutor(os.cpu_count() or 2) as ex:
    list(ex.map(encode, jobs))

OUT.mkdir(parents=True, exist_ok=True)
index = {}
for pack, items in keys.items():
    entries = []
    with open(OUT / f'{pack}.mp3', 'wb') as out:
        for i, (key, _text) in enumerate(items):
            data = (tmp / f'{pack}_{i}.mp3').read_bytes()
            out.write(data)
            entries.append([key, len(data)])
    index[pack] = entries
(OUT / 'index.json').write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf8')
print('done:', sum(len(v) for v in index.values()), 'clips in', len(index), 'packs')
