"""Build a local, read-only comparison of preserved sanctuary art versions.

Run after the web export: python scripts/create_map_review.py
Serve dist as usual and open /map-review.html. No game source or image is edited.
"""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
output = root / "dist"
images = output / "map-review"
images.mkdir(parents=True, exist_ok=True)
for version in (2, 3, 4, 5):
    name = f"sanctuary-v{version}.png"
    shutil.copy2(root / "assets/world" / name, images / name)

html = """<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Path of Teophoros — map version comparison</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#16221c;color:#f9eed2;font:18px/1.5 system-ui,sans-serif}
main{max-width:1500px;margin:auto;padding:24px}h1{font-size:28px;margin:0 0 8px}p{max-width:1000px}
.controls{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}button,select{font:inherit;padding:10px;background:#f8d592;color:#30271c;border:2px solid #c38d46;border-radius:0}
button[aria-pressed=true]{background:#7cba90;color:#12251a}label{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pair label{display:block;height:94px}.pair select,.pair strong{display:block;margin-top:6px}.pair strong{padding:12px 0}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}.frame{overflow:hidden;aspect-ratio:3/2;margin-top:12px;border:2px solid #96734b}
img{display:block;width:100%;height:100%;object-fit:fill;transform-origin:48% 49%}.detail img{transform:scale(2.6)}
figcaption{margin:10px 0;color:#d2c5a7}figure{margin:0;min-width:0}.notice{border-left:4px solid #dca95a;padding-left:14px}
@media(max-width:750px){.pair{grid-template-columns:1fr}main{padding:16px}h1{font-size:24px}}
</style>
<main><h1>Sanctuary map — preserved versions</h1>
<p>Compare the same area and scale. Look at the tree edges, path texture and size of the temple motif in the floor mosaic.</p>
<p class="notice">Preserved source images only. The live game uses version 5 with the version 4 floor disc and original version 2 temple façade layered over it. This page shows the unmodified originals and does not change terrain or saved journeys.</p>
<div class="controls"><button id="whole" aria-pressed="true">Whole map</button><button id="detail" aria-pressed="false">Courtyard detail</button></div>
<div class="pair" id="pair">
<figure><label>Earlier version <select id="earlier" aria-label="Earlier map version"><option value="2">v2 — earlier texture</option><option value="3">v3 — cabin, grove and lake</option><option value="4" selected>v4 — lake without painted fish</option></select></label><div class="frame"><img id="before" src="map-review/sanctuary-v4.png" alt="Earlier sanctuary map"></div><figcaption id="caption">Version 4, before the final floor-mosaic edit.</figcaption></figure>
<figure><label>Preserved base <strong>v5</strong></label><div class="frame"><img src="map-review/sanctuary-v5.png" alt="Unmodified version five sanctuary map"></div><figcaption>Version 5 before the bounded floor repair: enlarged central motif and softer detail.</figcaption></figure>
</div></main><script>
const pair=document.getElementById('pair'),whole=document.getElementById('whole'),detail=document.getElementById('detail');
function showDetail(on){pair.classList.toggle('detail',on);whole.setAttribute('aria-pressed',String(!on));detail.setAttribute('aria-pressed',String(on));}
whole.onclick=()=>showDetail(false);detail.onclick=()=>showDetail(true);
document.getElementById('earlier').onchange=e=>{document.getElementById('before').src='map-review/sanctuary-v'+e.target.value+'.png';document.getElementById('caption').textContent={2:'Version 2 has a different grove and smaller water area.',3:'Version 3 introduced the current home-map layout, with painted fish.',4:'Version 4, before the final floor-mosaic edit.'}[e.target.value];};
</script></html>"""
(output / "map-review.html").write_text(html, encoding="utf-8")
print(output / "map-review.html")
