import sys,json,subprocess,os,numpy as np,soundfile as sf
from playwright.sync_api import sync_playwright
FPS=24;GAP=0.55;LEAD=0.5
ch={c["id"]:c for c in json.load(open("chapters.json"))}
OUTRO_H={"1.1":"Capítulo 2: tu marca y tus conexiones","1.2":"Capítulo 3: interactuar y medir","1.3":"Haz el quiz del módulo 1","2.1":"Capítulo 2: interrumpir con valor","2.2":"Capítulo 3: objeciones y pipeline sano","2.3":"Haz el quiz del módulo 2","3.1":"Capítulo 2: descubrimiento","3.2":"Capítulo 3: el vendedor desafiante","3.3":"Haz el quiz del módulo 3","4.1":"Capítulo 2: problema, necesidad y sentimiento","4.2":"Capítulo 3: el control de la venta","4.3":"Haz el quiz del módulo 4","5.1":"Capítulo 2: hablar de dinero","5.2":"Capítulo 3: momentum y posventa","5.3":"Haz el quiz del módulo 5","6.1":"Capítulo 2: crear hábitos","6.2":"Capítulo 3: cultura y brand story","6.3":"Haz el quiz del módulo 6","7.1":"Capítulo 2: pitch, detector y desafiante","7.2":"Capítulo 3: tu plan 30-60-90","7.3":"Examen final y certificado"}
def build(i):
    c=ch[i];f=i.replace(".","_")
    meta=json.load(open(f"audio/{f}.json"))
    times=[];t=LEAD;audio=[]
    sr=24000
    for n,m in enumerate(meta):
        w,s=sf.read(m["file"]);assert s==sr
        a=t;b=t+0.35+m["dur"]+GAP
        times.append({"a":a-(LEAD if n==0 else 0) if n==0 else a,"b":b});audio.append((a+0.35,w))
        t=b
    times[0]["a"]=0
    total=times[-1]["b"]
    buf=np.zeros(int(total*sr)+sr,dtype=np.float32)
    for st,w in audio:
        k=int(st*sr);buf[k:k+len(w)]+=w.astype(np.float32)
    sf.write(f"video/{f}.wav",buf,sr)
    data={"id":i,"title":c["title"],"module":c["module"],"scenes":c["scenes"],"times":times,"outroH":OUTRO_H[i]}
    return data,total
def render(page,i):
    f=i.replace(".","_");os.makedirs("video",exist_ok=True)
    data,total=build(i)
    page.evaluate("d=>R.setup(d)",data)
    n=int(total*FPS)
    ff=subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","image2pipe","-framerate",str(FPS),"-c:v","mjpeg","-i","-","-i",f"video/{f}.wav","-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p","-c:a","aac","-b:a","112k","-shortest","-movflags","+faststart",f"video/{f}.mp4"],stdin=subprocess.PIPE)
    last=None;img=None
    for k in range(n):
        sig=page.evaluate("t=>R.frame(t)",k/FPS)
        if sig!=last:
            img=page.screenshot(type="jpeg",quality=88);last=sig
        ff.stdin.write(img)
    ff.stdin.close();ff.wait()
    print("rendered",i,round(total,1),"s",os.path.getsize(f"video/{f}.mp4")//1024,"KB",flush=True)
if __name__=="__main__":
    ids=sys.argv[1].split(",")
    with sync_playwright() as p:
        ex="/opt/pw-browsers/chromium"
        b=p.chromium.launch(**({"executable_path":ex} if os.path.exists(ex) else {}),args=["--no-sandbox","--allow-file-access-from-files"])
        pg=b.new_page(viewport={"width":1280,"height":720})
        pg.goto("file://"+os.path.abspath("render.html"));pg.wait_for_timeout(800)
        pg.evaluate("document.fonts.ready")
        for i in ids:
            while not os.path.exists(f"audio/{i.replace('.','_')}.json"):
                import time;time.sleep(5)
            render(pg,i)
        b.close()
