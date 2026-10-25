"""Genera los íconos de la PWA (marca 'm' de MarketLogic) en public/icons. Uso: python3 tools/make_icons.py"""
from PIL import Image, ImageDraw
import os
INK=(23,27,38);WHITE=(240,240,240);OR=(255,91,9)
S=4  # supersampling
def mark(size,frac):
    # geometría base en lienzo de 512
    N=512*S
    im=Image.new("RGB",(N,N),INK);d=ImageDraw.Draw(im)
    k=S
    def circ(cx,cy,r,col):d.ellipse([(cx-r)*k,(cy-r)*k,(cx+r)*k,(cy+r)*k],fill=col)
    def rect(x0,y0,x1,y1,col):d.rectangle([x0*k,y0*k,x1*k,y1*k],fill=col)
    top,bot,t=122,338,27
    humps=[(195.5,72),(315,74)]
    for cx,R in humps:
        cy=top+R;circ(cx,cy,R,WHITE);rect(cx-R,cy,cx+R,bot,WHITE)
    for cx,R in humps:
        cy=top+R;circ(cx,cy,R-t,INK);rect(cx-R+t,cy,cx+R-t,bot,INK)
    for x0 in (182,303):
        d.rounded_rectangle([x0*k,190*k,(x0+25)*k,bot*k],radius=12*k,fill=OR)
        rect(x0,260,x0+25,bot,OR)
    # recortar a la marca y centrar con la fracción pedida
    box=(123*k,top*k,389*k,bot*k+1);m=im.crop(box)
    w=int(size*frac);h=int(m.size[1]*w/m.size[0])
    m=m.resize((w,h),Image.LANCZOS)
    out=Image.new("RGB",(size,size),INK);out.paste(m,((size-w)//2,(size-h)//2))
    return out
root=os.path.join(os.path.dirname(__file__),"..","public","icons");os.makedirs(root,exist_ok=True)
for name,size,frac in [("icon-512.png",512,.52),("icon-192.png",192,.52),("maskable-512.png",512,.40),("apple-touch-icon.png",180,.52),("favicon.png",48,.62)]:
    mark(size,frac).save(os.path.join(root,name),optimize=True)
print("íconos listos")
