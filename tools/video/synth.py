import json,sys,os,numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
ids=sys.argv[1].split(",");voice=sys.argv[2] if len(sys.argv)>2 else "ef_dora"
os.makedirs("audio",exist_ok=True)
k=Kokoro("kokoro.int8.onnx","voices.bin")
for i in ids:
    d=json.load(open(f"narration/ch_{i.replace('.','_')}_opus.json"))
    segs=[d["intro"]]+d["scenes"]+[d["outro"]]
    meta=[]
    for n,t in enumerate(segs):
        out=f"audio/{i.replace('.','_')}_{n}.wav"
        if not os.path.exists(out):
            s,sr=k.create(t,voice=voice,speed=1.0,lang="es")
            sf.write(out,s,sr)
        else:
            s,sr=sf.read(out)
        meta.append({"text":t,"dur":len(s)/sr,"file":out})
    json.dump(meta,open(f"audio/{i.replace('.','_')}.json","w"),ensure_ascii=False)
    print("done",i,round(sum(m["dur"] for m in meta),1),flush=True)
