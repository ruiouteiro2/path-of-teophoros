"""Measure sprite contact baselines without modifying original art.

Usage: python scripts/measure_sprite_anchors.py image.png columns rows output.json
Low-alpha generator edge noise is ignored; all original pixels remain intact.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image

source,columns,rows,destination=sys.argv[1:]
columns,rows=int(columns),int(rows)
image=np.asarray(Image.open(source).convert('RGBA'))
height,width=image.shape[:2]
anchors=[]
for row in range(rows):
    for column in range(columns):
        x0,x1=round(column*width/columns),round((column+1)*width/columns)
        y0,y1=round(row*height/rows),round((row+1)*height/rows)
        ys,xs=np.where(image[y0:y1,x0:x1,3]>128)
        if not len(ys):raise ValueError(f'Empty cell {column},{row}')
        anchors.append(round((int(ys.max())+1)/(y1-y0),5))
Path(destination).write_text(json.dumps(anchors,indent=2)+'\n',encoding='utf-8')
print(f'{len(anchors)} contact baselines -> {destination}; range {min(anchors):.3f}..{max(anchors):.3f}')
