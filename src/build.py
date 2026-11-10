import io
# The drawing, measuring and export code is sliced from the original
# single-file app, kept as core.html; partA/B/C are the redesign around it.
src = io.open('core.html', encoding='utf-8').read().split('\n')
def seg(a, b): return '\n'.join(src[a-1:b])
core = seg(415, 1138)
ptr = seg(1316, 1477)
exp = seg(1773, 1964)
def rep(s, a, b, n=1):
    assert s.count(a) == n, (a, s.count(a))
    return s.replace(a, b)
core = rep(core, '  sel: null,\n', '  sel: null,\n  hover: null,                // a mark under the pointer in the list\n')
core = rep(core, 'return fracLabel(b) + "  (" + Math.round(b.acc) + "%)";', 'return fracLabel(b) + "  ·  " + Math.round(b.acc) + "%";')
core = rep(core, "c.font = '600 ' + px + 'px \"IBM Plex Mono\", ui-monospace, monospace';", "c.font = '600 ' + px + 'px \"IBM Plex Sans\", ui-sans-serif, sans-serif';")
core = rep(core, 'c.fillStyle = "rgba(8,10,13,.82)";', 'c.fillStyle = "rgba(10,14,25,.88)";')
core = rep(core, 'b.className = "z" + (square ? "" : " off");', 'b.className = "ang" + (square ? "" : " off");')
core = rep(core, 'ctx.fillStyle = "#16191F";', 'ctx.fillStyle = "#111626";')
core = rep(core, '''    c.arc(s.cx, s.cy, Math.max(s.r, 0.01), 0, Math.PI*2);
  }
  c.stroke();''', '''    c.arc(s.cx, s.cy, Math.max(s.r, 0.01), 0, Math.PI*2);
  }
  if (!env.forExport && S.hover === s.id){
    // a soft halo, so a row in the list can be found on the sheet
    c.save();
    c.globalAlpha = 0.35;
    c.lineWidth = strokeW(s, env) + env.hair * 10;
    c.stroke();
    c.restore();
  }
  c.stroke();''')
core = rep(core, """  var s = Math.min(CW / b.w, CH / b.h) * 0.92;
  S.view.scale = s;
  S.view.tx = (CW - b.w * s) / 2 - b.x * s;
  S.view.ty = (CH - b.h * s) / 2 - b.y * s;""", """  // keep clear of the coach above and the dock below
  var L = 0, W = CW, T = CH > 420 ? 58 : 10, H = CH - T - (CH > 420 ? 84 : 10);
  var s = Math.min(W / b.w, H / b.h) * 0.96;
  S.view.scale = s;
  S.view.tx = L + (W - b.w * s) / 2 - b.x * s;
  S.view.ty = T + (H - b.h * s) / 2 - b.y * s;""")
core = rep(core, "var off = 84 - deg * 10;", "var off = (d.clientWidth || 168) / 2 - deg * 10;")
ptr = rep(ptr, '''      var st = makeStamp(p);
      st.id = nextId++;
      S.shapes.push(st);
      S.sel = st.id;
    }''', '''      var st = makeStamp(p);
      st.id = nextId++;
      st.placed = true;             // exact by construction, until an end or edge is dragged
      S.shapes.push(st);
      S.sel = st.id;
      // a ratio stays armed, so the same size can be set down again and again
      S.snapMark = null;
      draw(); renderPanel();
      return;
    }''')
ptr = rep(ptr, '''  if (S.tool === "line" || S.tool === "circle") p = snapPt(p);
  if (S.tool === "line"){''', '''  var mk = S.tool === "measure" ? measureKind : null;
  if (mk) p = snapPt(p);
  if (mk === "line"){''')
ptr = rep(ptr, '''  if (S.tool === "circle"){
    snapshot();''', '''  if (mk === "circle"){
    snapshot();''')
ptr = rep(ptr, '''    if (S.tool === "select"){
      var hh = hitTest(toImg(ev));''', '''    if (S.tool === "select" || isRatioTool(S.tool)){
      var hh = hitTest(toImg(ev));''')
ptr = rep(ptr, '''  if (drag.mode === "draw-end" || drag.mode === "endpoint"){
    var ax, ay;''', '''  if (drag.mode === "draw-end" || drag.mode === "endpoint"){
    if (drag.mode === "endpoint") delete o.placed;   // resized by hand: no longer exact
    var ax, ay;''')
ptr = rep(ptr, '''  else if (drag.mode === "draw-radius" || drag.mode === "radius"){
''', '''  else if (drag.mode === "draw-radius" || drag.mode === "radius"){
    if (drag.mode === "radius") delete o.placed;
''')
ptr = rep(ptr, '''    } else if (drag.id === "alif"){
      setTool("select");''', '''    } else if (drag.id === "alif"){
      setTool("select");
      toast(S.shapes.length ? "Alif set — every mark now reads against it" : "Alif set. Now place a circle (C) or line (L) by ratio");''')
exp = rep(exp, 'sheet.appendChild(im); sheet.appendChild(sizes); sheet.appendChild(foot);',
  'var hd = document.createElement("h2"); hd.textContent = "Export PNG";\n  sheet.appendChild(hd); sheet.appendChild(im); sheet.appendChild(sizes); sheet.appendChild(foot);\n  m.addEventListener("keydown", function(e){ if (e.key === "Escape"){ e.stopPropagation(); close.click(); } });')
exp = rep(exp, '  build(startScale);\n}', '  build(startScale);\n  save.focus();\n}')
exp = rep(exp, '{id: nextId++, type: "circle", color: PALETTE[2][1], cx: alifX, cy: baseline - asc/2, r: L/2}',
                '{id: nextId++, type: "circle", color: PALETTE[2][1], cx: alifX, cy: baseline - asc/2, r: L/2, placed: true}')
exp = rep(exp, '''    document.getElementById("fname").textContent = S.name;
    fitView(); renderPanel();''', '''    document.getElementById("fname").textContent = S.name;
    $("start").hidden = false;
    fitView(); renderPanel(); updateCoach();''')
boot = '''
/* ---------------- boot ---------------- */
new ResizeObserver(function(){ resize(); renderRot(); }).observe(stage);
showTab(store("mansub.tab") || "measure");
setTool("select");
refreshSwatches();
renderRot();
renderPanel();
paintRange($("gridOp"));
resize();

function start(){ try { buildSample(); } catch (e) { $("drop").hidden = false; } }
if (document.fonts && document.fonts.load){
  Promise.race([
    document.fonts.load('400 300px Amiri').then(function(){ return document.fonts.ready; }),
    new Promise(function(res){ setTimeout(res, 2500); })
  ]).then(start, start);
} else start();

})();
</script>
</body>
</html>
'''
A = io.open('partA.html', encoding='utf-8').read()
B = io.open('partB.js', encoding='utf-8').read()
C = io.open('partC.js', encoding='utf-8').read()
out = A + '<script>\n(function(){\n"use strict";\n\n' + core + '\n' + B + '\n/* ---------------- pointer interaction ---------------- */\n' + ptr + '\n' + C + '\n' + exp + '\n' + boot
io.open('../index.html', 'w', encoding='utf-8', newline='\n').write(out)
print(len(out.split('\n')), 'lines')
