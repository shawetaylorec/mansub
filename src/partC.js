
/* ---------------- tools and the coach ---------------- */
/* Circle and Line set down exact sizes, picked from a palette beside the
   rail; drawing by hand is its own tool, the ruler. Between placements the
   ratio tools behave like Select, so a mark just set down can be nudged. */
var measureKind = "line";
function isRatioTool(t){ return t === "circle" || t === "line"; }
function toolCursor(){
  if (S.pending) return "copy";
  return (S.tool === "select" || isRatioTool(S.tool)) ? "grab" : "crosshair";
}
function setTool(t){
  cancelStamp();
  S.tool = t;
  document.querySelectorAll(".rail .tool[data-tool]").forEach(function(b){
    b.setAttribute("aria-pressed", String(b.dataset.tool === t));
  });
  if (isRatioTool(t)){
    stampKind = t;
    syncFly();
  }
  syncFlyShown();
  $("flyMeasure").hidden = t !== "measure";
  if (t !== "select" && S.img) hideStart();
  syncMeasure();
  cv.style.cursor = toolCursor();
  updateCoach();
}
/* The palette is for choosing a size; once one is armed it steps aside so
   the whole sheet is free to place on. Esc brings it back for another size. */
function syncFlyShown(){
  $("flyRatio").hidden = !isRatioTool(S.tool) || !!(S.pending && !isFixture(S.pending.kind));
}
function syncFly(){
  var circle = stampKind === "circle";
  $("flyT").textContent = circle ? "Circle by ratio" : "Line by ratio";
  $("flyS").textContent = circle
    ? (S.circMode === "diameter" ? "Its diameter" : "Its radius") + ", as a fraction of the alif"
    : "Its length, as a fraction of the alif";
  $("flyIc").innerHTML = document.querySelector('.rail .tool[data-tool="' + stampKind + '"] svg').outerHTML;
  $("stampOrient").hidden = circle;
  updateStampHint();
}
function syncMeasure(){
  document.querySelectorAll("#measKind button").forEach(function(b){
    b.setAttribute("aria-pressed", String(b.dataset.v === measureKind));
  });
  $("measHint").innerHTML = measureKind === "line"
    ? "Drag along what you want to measure. Hold <b>Shift</b> for 15° steps. Press <b>M</b> to switch to circles."
    : "Drag out from the centre of a curve. Circles are always true circles. Press <b>M</b> to switch to lengths.";
}
segBind("measKind", function(v){ measureKind = v; syncMeasure(); updateCoach(); });
$("flyX").addEventListener("click", function(){ setTool("select"); });
$("flyMX").addEventListener("click", function(){ setTool("select"); });

/* One line of guidance over the canvas, saying what a click will do now. */
function updateCoach(){
  var msg = "";
  if (S.pending){
    if (S.pending.kind === "key") msg = "Click to set the <b>key</b> down. It snaps to the grid. Esc cancels.";
    else if (S.pending.kind === "dots") msg = "Click to set the <b>dots</b> down. They snap into a grid column. Esc cancels.";
    else msg = "Click to set down a <b>" + S.pending.label + " alif " + S.pending.kind + "</b>. Keep clicking for more; Esc picks another size.";
  } else if (S.tool === "alif"){
    msg = "Drag from the <b>top of an alif to its foot</b>. It stays upright; straighten the image to meet it.";
  } else if (isRatioTool(S.tool)){
    msg = alifLen() > 0 ? "Pick a <b>size</b> from the palette, then click on the sheet."
                        : "Measure the alif first: press <b>A</b>, then drag along one.";
  } else if (S.tool === "measure"){
    msg = measureKind === "line"
      ? "Drag to measure a <b>length</b>. Hold Shift for 15° steps."
      : "Drag out from the <b>centre</b> to measure a circle.";
  } else if (S.img && alifLen() <= 0){
    msg = "Start by measuring an alif: press <b>A</b>, then drag along one.";
  }
  $("coachT").innerHTML = msg;
  $("coach").classList.toggle("off", !msg);
}

/* ---------------- the context bar ----------------
   Ink and thickness always act on what is selected; with nothing selected,
   they set up the next mark and the sheet's own weight. */
function selObj(){ return S.sel ? byId(S.sel) : null; }
function currentInk(){
  var o = selObj();
  if (S.sel === "alif") return S.alifColor;
  if (S.sel === "key") return null;
  return o && o.color ? o.color : S.color;
}
function syncCtx(){
  var o = selObj(), k, r = "", ink = currentInk();
  if (!o) k = "New marks";
  else if (S.sel === "alif") k = "The alif";
  else if (S.sel === "key") { k = "Key"; r = "colours follow your marks"; }
  else if (S.sel === "dots") k = "Alif in dots";
  else {
    k = o.type === "line" ? "Line" : "Circle";
    var b = bestFraction(ratioOf(o) || 0, S.maxDen);
    r = b ? fracLabel(b) + " alif · " + Math.round(b.acc) + "%" : "";
  }
  $("ctxK").textContent = k;
  $("ctxR").textContent = r; $("ctxR").hidden = !r;
  var kc = keyColors();
  $("ctxDot").style.background = ink ||
    "conic-gradient(" + kc.ring + " 0 50%, " + kc.bar + " 0 100%)";
  $("ctxDel").hidden = !S.sel;
  $("inkSw").classList.toggle("muted", S.sel === "key");
  document.querySelectorAll("#inkSw .sw").forEach(function(b){
    b.setAttribute("aria-pressed", String(b.dataset.hex === ink));
  });
  document.querySelectorAll(".paintDot").forEach(function(d){ d.style.background = S.color; });
  syncThick();
}

/* ---------------- the panel ---------------- */
var ratiosReady = null;
var ICONS = {
  line: function(c){ return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round"><path d="M3 13L13 3"/></svg>'; },
  circle: function(c){ return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="' + c + '" stroke-width="2"><circle cx="8" cy="8" r="5.5"/></svg>'; }
};
function renderPanel(){
  syncCtx();
  renderHistory();
  renderSteps();
  var L = alifLen(), ready = L > 0;
  if (ready !== ratiosReady){ ratiosReady = ready; renderRatios(); updateStampHint(); updateCoach(); }
  renderFixtures();

  $("alifCard").classList.toggle("unset", !ready);
  $("alifVal").innerHTML = ready ? Math.round(L) + "<small>px tall</small>" : "Not measured yet";
  $("sqSize").textContent = ready ? "Each square is " + (L / S.grid.div).toFixed(1) + " px" : "";
  $("alifGo").textContent = ready ? "Measure again" : "Measure the alif";
  $("alifGo").classList.toggle("primary", !ready);

  var list = $("mlist");
  list.innerHTML = "";
  $("mcount").textContent = S.shapes.length;
  $("btnClear").hidden = !S.shapes.length;
  if (!S.shapes.length){
    var e = document.createElement("div");
    e.className = "empty";
    e.innerHTML = ready
      ? "Draw a line <kbd>L</kbd> or a circle <kbd>C</kbd> over the script, and its proportion appears here."
      : "Measure the alif first. Then every line and circle you draw is read against it.";
    list.appendChild(e);
    return;
  }
  S.shapes.forEach(function(s){
    var ratio = ratioOf(s), b = ratio !== null ? bestFraction(ratio, S.maxDen) : null;
    var row = document.createElement("div");
    row.className = "mrow" + (S.sel === s.id ? " sel" : "");
    var what = s.type === "line" ? "Line" : (S.circMode === "diameter" ? "Circle, across" : "Circle, radius");
    var how = s.placed ? "Placed" : "Measured";
    var acc = b ? Math.round(b.acc) : null;
    var tier = acc === null ? "lo" : acc >= 97 ? "hi" : acc >= 90 ? "mid" : "lo";
    row.innerHTML =
      '<span class="ic">' + ICONS[s.type](s.color) + '</span>' +
      '<div><div class="fr">' + (ratio === null ? "—" : b ? fracLabel(b) : "0") + '<small>alif</small>' +
        '<span class="how' + (s.placed ? ' placed' : '') + '" title="' + (s.placed ? "Set down by ratio: exact" : "Drawn by hand") + '">' + how + '</span></div>' +
      '<div class="meta" title="' + what + '">' + (s.type === "circle" ? (S.circMode === "diameter" ? "⌀ " : "r ") : "") + Math.round(measureOf(s)) + ' px' +
        (ratio !== null ? ' · ' + ratio.toFixed(3) + '×' : '') + '</div></div>' +
      '<div class="acc ' + tier + '">' + (acc !== null ? '<span>' + acc + '%</span><span class="m"><i style="width:' + acc + '%"></i></span>' : '') + '</div>';
    var del = document.createElement("button");
    del.className = "del"; del.title = "Delete"; del.setAttribute("aria-label", "Delete");
    del.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg>';
    del.addEventListener("click", function(ev){
      ev.stopPropagation();
      snapshot();
      S.shapes = S.shapes.filter(function(x){ return x.id !== s.id; });
      if (S.sel === s.id) S.sel = null;
      S.hover = null;
      draw(); renderPanel();
    });
    row.appendChild(del);
    row.addEventListener("click", function(){ S.sel = s.id; setTool("select"); draw(); renderPanel(); });
    row.addEventListener("mouseenter", function(){ if (S.hover !== s.id){ S.hover = s.id; draw(); } });
    list.appendChild(row);
  });
}
$("mlist").addEventListener("mouseleave", function(){ if (S.hover !== null){ S.hover = null; draw(); } });

/* Steps along the top: what has been done, and what to do next. */
function renderSteps(){
  var done = {open: !!S.img && !S.isSample, straighten: S.rot !== 0, alif: alifLen() > 0, draw: S.shapes.length > 0};
  var cur = null;
  ["open", "alif", "draw"].forEach(function(k){ if (!cur && !done[k]) cur = k; });
  document.querySelectorAll("#steps li").forEach(function(li){
    var k = li.dataset.step;
    li.classList.toggle("done", !!done[k]);
    li.classList.toggle("current", k === cur);
  });
}
document.querySelectorAll("#steps li").forEach(function(li){
  li.querySelector("button").addEventListener("click", function(){
    var k = li.dataset.step;
    if (k === "open") $("fileIn").click();
    else if (k === "straighten"){
      var d = $("dock"); d.classList.remove("pulse"); void d.offsetWidth; d.classList.add("pulse");
      $("dial").focus();
      toast("Drag the dial until the script stands upright");
    }
    else if (k === "alif"){ showTab("measure"); setTool("alif"); }
    else { showTab("measure"); setTool("circle"); }
  });
});

/* tabs */
function showTab(name){
  if (name !== "measure" && name !== "view") name = "measure";
  document.querySelectorAll(".tabs button").forEach(function(b){ b.setAttribute("aria-selected", String(b.dataset.tab === name)); });
  document.querySelectorAll(".pane").forEach(function(p){ p.hidden = p.dataset.pane !== name; });
  store("mansub.tab", name);
}
document.querySelectorAll(".tabs button").forEach(function(b){
  b.addEventListener("click", function(){ showTab(b.dataset.tab); });
});

/* swatches */
function buildSwatches(host, list, current, onPick, small){
  host.innerHTML = "";
  list.forEach(function(p){
    var b = document.createElement("button");
    b.className = "sw" + (small ? " small" : "");
    b.style.background = p[1];
    b.dataset.hex = p[1];
    b.title = p[0];
    b.setAttribute("aria-label", p[0]);
    b.setAttribute("aria-pressed", String(current() === p[1]));
    b.addEventListener("click", function(){ onPick(p[1]); });
    host.appendChild(b);
  });
}
function refreshSwatches(){
  buildSwatches($("inkSw"), PALETTE, currentInk, function(hex){
    // the key takes its colours from the page, so it is never painted directly
    var o = S.sel && S.sel !== "alif" && S.sel !== "key" ? byId(S.sel) : null;
    if (o){ snapshot(); o.color = hex; }
    else if (S.sel === "alif"){ S.alifColor = hex; }
    else S.color = hex;
    if (o) S.color = hex;
    draw(); renderPanel();
  }, false);
  buildSwatches($("gridSw"), GRID_PALETTE, function(){ return S.gridColor; }, function(hex){
    S.gridColor = hex; refreshSwatches(); draw();
  }, true);
  syncCtx();
}

/* Recolour, or reweigh, every mark of one kind at once. */
function paintAll(type){
  var hit = S.shapes.filter(function(s){ return s.type === type; });
  if (!hit.length){ toast("There are no " + type + "s yet"); return; }
  snapshot();
  var ink = currentInk() || S.color;
  hit.forEach(function(s){ s.color = ink; });
  draw(); renderPanel();
  toast("Every " + type + " recoloured");
}
function thickAll(type){
  var hit = S.shapes.filter(function(s){ return s.type === type; });
  if (!hit.length){ toast("There are no " + type + "s yet"); return; }
  snapshot();
  var v = thickFromPos(+$("thick").value);
  hit.forEach(function(s){ s.w = v; });
  draw(); renderPanel();
  toast("Every " + type + " set to " + fmtThick(v));
}

/* the Apply to all menu */
var allMenu = $("allMenu"), allBtn = $("allBtn");
function closeMenu(){ allMenu.hidden = true; allBtn.setAttribute("aria-expanded", "false"); }
allBtn.addEventListener("click", function(ev){
  ev.stopPropagation();
  if (!allMenu.hidden){ closeMenu(); return; }
  var r = allBtn.getBoundingClientRect();
  allMenu.style.left = Math.min(r.left, window.innerWidth - 236) + "px";
  allMenu.style.top = (r.bottom + 6) + "px";
  allMenu.hidden = false; allBtn.setAttribute("aria-expanded", "true");
  allMenu.querySelector("button").focus();
});
allMenu.querySelectorAll("button").forEach(function(b){
  b.addEventListener("click", function(){
    closeMenu();
    if (b.dataset.a === "paint") paintAll(b.dataset.t); else thickAll(b.dataset.t);
  });
});
document.addEventListener("pointerdown", function(ev){ if (!allMenu.hidden && !allMenu.contains(ev.target) && ev.target !== allBtn) closeMenu(); });

$("ctxDel").addEventListener("click", deleteSel);
function deleteSel(){
  if (!S.sel) return;
  snapshot();
  if (S.sel === "alif") S.alif = null;
  else if (S.sel === "key") S.key = null;
  else if (S.sel === "dots") S.dots = null;
  else S.shapes = S.shapes.filter(function(s){ return s.id !== S.sel; });
  S.sel = null; draw(); renderPanel();
}

/* ---------------- switches, kept in step wherever they appear ---------------- */
function setAlifShown(on){
  S.alifShown = on;
  $("alifOn").checked = on;
  $("vtAlif").setAttribute("aria-pressed", String(on));
  $("alifEye").setAttribute("aria-pressed", String(on));
  if (!on && S.sel === "alif") S.sel = null;
}
function setGrid(on){
  S.grid.on = on;
  $("gridOn").checked = on;
  $("gridTog").setAttribute("aria-pressed", String(on));
  draw();
}
function setSnap(on){
  S.snap = on;
  $("snapOn").checked = on;
  $("snapTog").setAttribute("aria-pressed", String(on));
  if (S.ghost) draw();
}
$("alifOn").addEventListener("change", function(e){ setAlifShown(e.target.checked); draw(); renderPanel(); });
function toggleAlif(){
  setAlifShown(!S.alifShown); draw(); renderPanel();
  toast(S.alifShown ? "Alif measure shown" : "Alif measure hidden, here and in the export. The grid still follows it");
}
function setLabels(on){
  S.labels = on;
  $("showLabels").checked = on;
  $("vtLabels").setAttribute("aria-pressed", String(on));
  draw();
}
function toggleLabels(){
  setLabels(!S.labels);
  toast(S.labels ? "Labels shown" : "Labels hidden, here and in the export");
}
$("vtAlif").addEventListener("click", toggleAlif);
$("vtLabels").addEventListener("click", toggleLabels);
$("alifEye").addEventListener("click", function(){ setAlifShown(!S.alifShown); draw(); renderPanel(); });
$("gridOn").addEventListener("change", function(e){ setGrid(e.target.checked); });
$("gridTog").addEventListener("click", function(){ setGrid(!S.grid.on); toast(S.grid.on ? "Grid shown" : "Grid hidden"); });
$("snapOn").addEventListener("change", function(e){ setSnap(e.target.checked); });
$("snapTog").addEventListener("click", function(){ setSnap(!S.snap); toast(S.snap ? "Snap on — to marks, then grid crossings" : "Snap off"); });
$("alifGo").addEventListener("click", function(){ setTool("alif"); });

/* ---------------- controls ---------------- */
document.querySelectorAll(".rail .tool[data-tool]").forEach(function(b){
  b.addEventListener("click", function(){ setTool(b.dataset.tool); });
});
$("gridDiv").addEventListener("change", function(e){ S.grid.div = +e.target.value; draw(); renderPanel(); });
function paintRange(r){ r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
$("gridOp").addEventListener("input", function(e){
  S.grid.op = +e.target.value / 100;
  $("gridOpV").textContent = e.target.value + "%";
  paintRange(e.target);
  draw();
});
/* The thickness slider works like the ink: with a line or circle selected
   it sets that one shape; with nothing selected it sets the sheet's
   thickness, which every shape not given its own follows. */
function selShape(){
  var o = S.sel && S.sel !== "alif" && S.sel !== "key" && S.sel !== "dots" ? byId(S.sel) : null;
  return o && (o.type === "line" || o.type === "circle") ? o : null;
}
/* The slider is calibrated to the sheet: its middle is the default
   thickness for this image (S.thickBase). Left runs down to a tenth of it,
   right up to four times it, each half on a log scale so every step is the
   same proportion; fine, thin strokes get most of the travel and the top
   stops well short of filling a circle in. */
var THICK_LO = 10, THICK_HI = 4;
function thickFromPos(p){
  var t = (p - 50) / 50;
  var w = S.thickBase * Math.pow(t < 0 ? THICK_LO : THICK_HI, t);
  return Math.round(w * 100) / 100;
}
function posFromThick(w){
  var r = Math.log(w / S.thickBase);
  var t = r / Math.log(r < 0 ? THICK_LO : THICK_HI);
  return Math.round(50 + 50 * Math.max(-1, Math.min(1, t)));
}
function fmtThick(w){ return (w < 10 ? w.toFixed(1) : Math.round(w)) + "px"; }
function syncThick(){
  var o = selShape(), v = o ? (o.w || S.thick) : S.thick;
  var th = $("thick");
  th.value = posFromThick(v);
  paintRange(th);
  $("thickV").textContent = fmtThick(v);
}
var thickSnapped = false;
$("thick").addEventListener("input", function(e){
  var v = thickFromPos(+e.target.value), o = selShape();
  if (o){
    if (!thickSnapped){ snapshot(); thickSnapped = true; }
    o.w = v;
  } else S.thick = v;
  $("thickV").textContent = fmtThick(v);
  paintRange(e.target);
  draw();
});
$("thick").addEventListener("change", function(){ thickSnapped = false; });
segBind("circMode", function(v){ S.circMode = v; syncFly(); draw(); renderPanel(); });
$("maxDen").addEventListener("change", function(e){ S.maxDen = +e.target.value; draw(); renderPanel(); });
$("showLabels").addEventListener("change", function(e){ setLabels(e.target.checked); });
$("btnUndo").addEventListener("click", undo);
$("btnRedo").addEventListener("click", redo);
$("btnClear").addEventListener("click", function(){
  if (!S.shapes.length) return;
  snapshot(); var n = S.shapes.length; S.shapes = []; S.sel = null; draw(); renderPanel();
  toast(n + (n === 1 ? " mark" : " marks") + " cleared — Ctrl+Z brings them back");
});
$("zIn").addEventListener("click", function(){ zoomAt(CW/2, CH/2, 1.25); });
$("zOut").addEventListener("click", function(){ zoomAt(CW/2, CH/2, 0.8); });
$("zFit").addEventListener("click", fitView);
$("zVal").addEventListener("click", fitView);

/* help */
function openHelp(){ $("help").hidden = false; $("helpX").focus(); }
function closeHelp(){ $("help").hidden = true; }
$("btnHelp").addEventListener("click", openHelp);
$("helpX").addEventListener("click", closeHelp);
$("help").addEventListener("click", function(e){ if (e.target === $("help")) closeHelp(); });

/* the start prompt: upload, paste, or look at the sample first */
function hideStart(){ $("start").hidden = true; }
$("startX").addEventListener("click", hideStart);
$("startSample").addEventListener("click", hideStart);
$("startZone").addEventListener("click", function(){ $("fileIn").click(); });
$("start").addEventListener("click", function(e){ if (e.target === $("start")) hideStart(); });
var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
document.querySelectorAll(".modkey").forEach(function(k){ k.textContent = isMac ? "⌘" : "Ctrl"; });

document.addEventListener("keydown", function(ev){
  var t = ev.target.tagName;
  if (!$("help").hidden){ if (ev.key === "Escape" || ev.key === "?") closeHelp(); return; }
  if (!$("start").hidden && ev.key === "Escape"){ hideStart(); return; }
  if (!allMenu.hidden && ev.key === "Escape"){ closeMenu(); allBtn.focus(); return; }
  if (t === "INPUT" || t === "SELECT" || t === "TEXTAREA") return;
  if (ev.code === "Space"){ spaceDown = true; cv.style.cursor = "grab"; ev.preventDefault(); return; }
  var mod = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase();
  if (mod && (k === "y" || (k === "z" && ev.shiftKey))){ ev.preventDefault(); redo(); return; }
  if (mod && k === "z"){ ev.preventDefault(); undo(); return; }
  if (mod) return;
  if (ev.key === "Delete" || ev.key === "Backspace"){
    if (S.sel){ ev.preventDefault(); deleteSel(); }
    return;
  }
  if (ev.key === "?"){ openHelp(); return; }
  if (k === "v") setTool("select");
  else if (k === "a") setTool("alif");
  else if (k === "l") setTool("line");
  else if (k === "c") setTool("circle");
  else if (k === "m"){
    if (S.tool === "measure"){ measureKind = measureKind === "line" ? "circle" : "line"; syncMeasure(); updateCoach(); }
    else setTool("measure");
  }
  else if (k === "k") toggleFixture("key");
  else if (k === "n") toggleFixture("dots");
  else if (k === "g"){ setGrid(!S.grid.on); toast(S.grid.on ? "Grid shown" : "Grid hidden"); }
  else if (k === "s"){ setSnap(!S.snap); toast(S.snap ? "Snap on — to marks, then grid crossings" : "Snap off"); }
  else if (k === "h") toggleAlif();
  else if (k === "t") toggleLabels();
  else if (k === "0") fitView();
  else if (ev.key === "["){ ev.preventDefault(); rotateBy(-Math.PI / 1800); }
  else if (ev.key === "]"){ ev.preventDefault(); rotateBy(Math.PI / 1800); }
  else if (ev.key === "Escape"){
    // first Esc stops placing; the next puts the tool down
    if (S.pending) cancelStamp();
    else if (S.tool !== "select" && !S.sel) setTool("select");
    S.sel = null; draw(); renderPanel();
  }
});
document.addEventListener("keyup", function(ev){
  if (ev.code === "Space"){ spaceDown = false; cv.style.cursor = toolCursor(); }
});

/* ---------------- loading images ---------------- */
function loadImage(src, name){
  var im = new Image();
  im.onload = function(){
    S.img = im; S.name = name; S.isSample = false;
    S.alif = null; S.shapes = []; S.key = null; S.dots = null; S.sel = null; S.hover = null;
    undoStack = []; redoStack = [];
    hideStart();
    setAlifShown(true);
    S.rot = 0; renderRot();
    S.thick = S.thickBase = Math.max(2, Math.round(Math.hypot(im.naturalWidth, im.naturalHeight) / 700));
    $("fname").textContent = name;
    $("drop").hidden = true;
    showTab("measure");
    setTool("alif");
    fitView(); renderPanel();
    toast("Opened. If the page leans, straighten it with the dial first");
  };
  im.onerror = function(){ toast("That file could not be read as an image — try a JPG or PNG"); };
  im.src = src;
}
function loadFile(file){
  if (!file || !/^image\//.test(file.type)){ if (file) toast("That isn't an image — try a JPG or PNG"); return; }
  var fr = new FileReader();
  fr.onload = function(){ loadImage(fr.result, file.name); };
  fr.readAsDataURL(file);
}
$("btnOpen").addEventListener("click", function(){ $("fileIn").click(); });
$("fileIn").addEventListener("change", function(e){
  if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
  e.target.value = "";
});
function hasFiles(e){ return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") >= 0; }
["dragenter","dragover"].forEach(function(t){
  window.addEventListener(t, function(e){
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (!$("start").hidden){ $("startZone").classList.add("over"); return; }
    stage.classList.add("over"); $("drop").hidden = false;
  });
});
function dropDone(){ stage.classList.remove("over"); $("startZone").classList.remove("over"); if (S.img) $("drop").hidden = true; }
window.addEventListener("dragleave", function(e){ if (!e.relatedTarget) dropDone(); });
window.addEventListener("drop", function(e){
  if (!hasFiles(e)) return;
  e.preventDefault(); dropDone();
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});
window.addEventListener("paste", function(e){
  var items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  for (var i = 0; i < items.length; i++){
    if (items[i].type.indexOf("image") === 0){ loadFile(items[i].getAsFile()); break; }
  }
});
