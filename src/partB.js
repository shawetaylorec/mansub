
function $(id){ return document.getElementById(id); }

/* ---------------- small feedback ---------------- */
var toastT = null;
function toast(msg){
  var t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(function(){ t.classList.remove("on"); }, 1900);
}
function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

/* ---------------- undo / redo ---------------- */
var redoStack = [];
function stateNow(){ return JSON.stringify({a: S.alif, s: S.shapes, k: S.key, d: S.dots, r: S.rot}); }
function snapshot(){
  undoStack.push(stateNow());
  if (undoStack.length > 80) undoStack.shift();
  redoStack = [];
  renderHistory();
}
function restoreState(json){
  var st = JSON.parse(json);
  S.alif = st.a; S.shapes = st.s; S.key = st.k || null; S.dots = st.d || null; S.sel = null;
  S.rot = st.r || 0;               // marks and sheet are only meaningful together
  renderRot(); draw(); renderPanel();
}
function undo(){ if (!undoStack.length) return; redoStack.push(stateNow()); restoreState(undoStack.pop()); }
function redo(){ if (!redoStack.length) return; undoStack.push(stateNow()); restoreState(redoStack.pop()); }
function renderHistory(){
  $("btnUndo").disabled = !undoStack.length;
  $("btnRedo").disabled = !redoStack.length;
}

/* ---------------- exact ratios ----------------
   Rather than drawing a shape and nudging it towards a ratio, ask for the
   ratio and get it exactly; the only thing left to decide is where it sits. */
var stampKind = "circle", stampOrient = "v", armedKey = null;

function makeStamp(p){
  var L = alifLen(), r = S.pending.ratio;
  if (S.pending.kind === "circle"){
    var rad = (S.circMode === "diameter") ? r * L / 2 : r * L;
    return snapShape({id: 0, type: "circle", color: S.color, cx: p.x, cy: p.y, r: rad});
  }
  var half = r * L / 2;
  return snapShape((S.pending.orient === "v")
    ? {id: 0, type: "line", color: S.color, x1: p.x, y1: p.y - half, x2: p.x, y2: p.y + half}
    : {id: 0, type: "line", color: S.color, x1: p.x - half, y1: p.y, x2: p.x + half, y2: p.y});
}

function armStamp(label, num, den, key){
  if (alifLen() <= 0){ toast("Measure the alif first — a ratio is a fraction of it"); return; }
  S.pending = {ratio: num / den, kind: stampKind, orient: stampOrient, label: label};
  S.ghost = null;
  armedKey = key;
  S.sel = null;
  cv.style.cursor = "copy";
  renderRatios(); updateStampHint(); renderFixtures(); updateCoach();
  draw(); syncCtx();
}

function cancelStamp(){
  if (!S.pending) return;
  S.pending = null; S.ghost = null; armedKey = null;
  cv.style.cursor = toolCursor();
  renderRatios(); updateStampHint(); renderFixtures(); updateCoach(); draw();
}

/* The key and the dots are placed the same way as an exact ratio: each
   follows the pointer, already snapped, until a click sets it down. There
   is one of each on the sheet; placing again moves it. */
var FIXTURES = {
  key: {
    noun: "key", btn: "keyBtn", rail: "railKey", del: "keyDel", hint: "keyHint",
    notYet: "Measure the alif first — the key is one alif across",
    before: "A circle one alif across with an alif through it. Measure the alif first.",
    idle: "A circle one alif across with an alif through it, as a legend for the sheet.",
    placed: function(){ return "On the sheet. Its circle and line take the colours most used by your circles and lines."; }
  },
  dots: {
    noun: "dots", btn: "dotsBtn", rail: "railDots", del: "dotsDel", hint: "dotsHint",
    notYet: "Measure the alif first — the dots are counted against it",
    before: "The traditional proof: the alif as a column of rhombic dots. Measure the alif first.",
    idle: "The traditional proof: the alif as a column of rhombic dots, one to each grid square.",
    placed: function(){ return "On the sheet, " + S.grid.div + " dots tall. Select it and pick an ink to recolour it."; }
  }
};
function isFixture(kind){ return kind === "key" || kind === "dots"; }
function placingFixture(kind){ return !!(S.pending && S.pending.kind === kind); }

function armFixture(kind){
  if (alifLen() <= 0){ toast(FIXTURES[kind].notYet); return; }
  S.pending = {kind: kind, label: kind};
  S.ghost = null;
  armedKey = kind;
  S.sel = null;
  cv.style.cursor = "copy";
  renderRatios(); updateStampHint(); renderFixtures(); updateCoach();
  draw(); syncCtx();
}
function toggleFixture(kind){ if (placingFixture(kind)) cancelStamp(); else armFixture(kind); }

function renderFixtures(){
  Object.keys(FIXTURES).forEach(function(kind){
    var f = FIXTURES[kind], placing = placingFixture(kind), here = !!S[kind];
    var b = $(f.btn), r = $(f.rail);
    b.setAttribute("aria-pressed", String(placing));
    r.setAttribute("aria-pressed", String(placing));
    r.classList.toggle("has", here && !placing);
    b.disabled = alifLen() <= 0;
    $(f.btn + "T").textContent = placing ? "Placing… Esc to cancel" : (here ? "Move " : "Add ") + f.noun;
    $(f.del).hidden = !here;
    $(f.hint).textContent = alifLen() <= 0 ? f.before : (here ? f.placed() : f.idle);
  });
}
Object.keys(FIXTURES).forEach(function(kind){
  var f = FIXTURES[kind];
  $(f.btn).addEventListener("click", function(){ toggleFixture(kind); });
  $(f.rail).addEventListener("click", function(){ toggleFixture(kind); });
  $(f.del).addEventListener("click", function(){
    if (!S[kind]) return;
    snapshot(); S[kind] = null;
    if (S.sel === kind) S.sel = null;
    draw(); renderPanel();
  });
});

function updateStampHint(){
  var h = $("stampHint");
  if (S.pending && !isFixture(S.pending.kind)){
    h.innerHTML = "Click on the sheet to set down a <b>" + S.pending.label + " alif " + S.pending.kind +
      "</b>, as many times as you like. <b>Esc</b> stops.";
  } else if (alifLen() <= 0){
    h.innerHTML = "Measure the alif first: every size here is a fraction of it.";
  } else {
    h.innerHTML = "Pick a size. It follows your pointer until you click to set it down, exact by construction.";
  }
}

function renderRatios(){
  var host = $("ratios");
  host.innerHTML = "";
  var ready = alifLen() > 0;
  PRESETS.forEach(function(p, i){
    var b = document.createElement("button");
    b.textContent = p[0];
    b.title = p[0] + " of an alif";
    b.disabled = !ready;
    b.setAttribute("aria-pressed", String(armedKey === "p" + i));
    b.addEventListener("click", function(){
      if (armedKey === "p" + i) cancelStamp(); else armStamp(p[0], p[1], p[2], "p" + i);
    });
    host.appendChild(b);
  });
}

function segBind(id, fn){
  var bs = document.querySelectorAll("#" + id + " button");
  bs.forEach(function(b){
    b.addEventListener("click", function(){
      bs.forEach(function(o){ o.setAttribute("aria-pressed", String(o === b)); });
      fn(b.dataset.v);
    });
  });
}
segBind("stampOrient", function(v){
  stampOrient = v;
  if (S.pending && !isFixture(S.pending.kind)){ S.pending.orient = v; draw(); }
});
$("cGo").addEventListener("click", function(){
  var n = Math.max(1, Math.round(+$("cNum").value || 1));
  var d = Math.max(1, Math.round(+$("cDen").value || 1));
  var g = gcd(n, d); n /= g; d /= g;
  armStamp(d === 1 ? String(n) : n + "/" + d, n, d, "custom");
});
