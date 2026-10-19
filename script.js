"use strict";
const $ = id => document.getElementById(id);

const FONTS = ["Caveat","Kalam","Indie Flower","Patrick Hand","Shadows Into Light","Reenie Beanie","Homemade Apple","Gochi Hand","Covered By Your Grace","Nanum Pen Script"];
const INKS = {"Biru pulpen":"#1b3fa6","Hitam":"#1a1a1f","Hijau tua":"#14573c","Merah":"#b3261e"};
const PAPERS = {
  garis:{name:"Bergaris putih",bg:"#fbfaf6",line:"rgba(70,120,190,.45)",margin:true},
  kotak:{name:"Kotak-kotak",bg:"#fbfaf6",line:"rgba(70,120,190,.35)",grid:true},
  polos:{name:"Polos",bg:"#fcfbf7"},
  kuning:{name:"Buku kuning",bg:"#f7ec9e",line:"rgba(150,110,60,.5)",margin:true},
  kraft:{name:"Kertas deli (kraft)",bg:"#c9a672",line:"rgba(90,60,30,.3)"}
};

FONTS.forEach(f => $("font").add(new Option(f, f)));
Object.entries(INKS).forEach(([n, c]) => $("ink").add(new Option(n, c)));
Object.entries(PAPERS).forEach(([k, p]) => $("paper").add(new Option(p.name, k)));

const rng = seed => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const read = () => ({
  text: $("txt").value, head: $("head").value.trim(), font: $("font").value, ink: $("ink").value,
  paper: $("paper").value, fs: +$("fs").value, lh: +$("lh").value, mess: +$("mess").value / 100,
  fx: $("fx").value, s: +$("q").value
});

function noiseTile(R) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d"), d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) {
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 128 + (R() - .5) * 255; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0); return c;
}

function metrics(P) {
  const s = P.s;
  return { s, W: 1240 * s, H: 1754 * s, lh: P.lh * s, fs: P.fs * s, top: 150 * s, bottom: 90 * s,
    left: (P.paper === "polos" ? 110 : 150) * s, right: 80 * s };
}

function wrap(P, m) {
  const c = document.createElement("canvas").getContext("2d");
  c.font = `${m.fs}px "${P.font}"`;
  const maxW = m.W - m.left - m.right, sp = c.measureText(" ").width, lines = [];
  const chunks = w => {
    const out = [];
    while (c.measureText(w).width > maxW && w.length > 1) {
      let k = w.length - 1;
      while (k > 1 && c.measureText(w.slice(0, k)).width > maxW) k--;
      out.push(w.slice(0, k)); w = w.slice(k);
    }
    out.push(w); return out;
  };
  for (const para of P.text.replace(/\r/g, "").split("\n")) {
    if (!para.trim()) { lines.push([]); continue; }
    let cur = [], curW = 0;
    for (const word of para.split(/\s+/).filter(Boolean)) {
      for (const t of chunks(word)) {
        const w = c.measureText(t).width;
        if (cur.length && curW + sp + w > maxW) { lines.push(cur); cur = []; curW = 0; }
        curW += (cur.length ? sp : 0) + w; cur.push({ t, w });
      }
    }
    lines.push(cur);
  }
  return lines;
}

function drawPage(lines, m, P, R, first) {
  const cv = document.createElement("canvas"); cv.width = m.W; cv.height = m.H;
  const x = cv.getContext("2d"), pp = PAPERS[P.paper], s = m.s;
  const n = Math.floor((m.H - m.top - m.bottom) / m.lh);
  x.fillStyle = pp.bg; x.fillRect(0, 0, m.W, m.H);
  if (pp.line) {
    x.strokeStyle = pp.line; x.lineWidth = Math.max(1, 1.6 * s); x.beginPath();
    for (let i = 0; i <= n; i++) { const y = m.top + i * m.lh; x.moveTo(0, y); x.lineTo(m.W, y); }
    if (pp.grid) for (let v = m.left % m.lh; v < m.W; v += m.lh) { x.moveTo(v, m.top); x.lineTo(v, m.top + n * m.lh); }
    x.stroke();
  }
  if (pp.margin) {
    x.strokeStyle = "rgba(210,70,70,.55)"; x.lineWidth = 2 * s; x.beginPath();
    x.moveTo(m.left - 14 * s, 0); x.lineTo(m.left - 14 * s, m.H); x.stroke();
  }
  x.font = `${m.fs}px "${P.font}"`; x.fillStyle = P.ink; x.textBaseline = "alphabetic";
  const sp = x.measureText(" ").width, j = P.mess;
  x.globalCompositeOperation = "multiply";
  if (first && P.head) {
    x.textAlign = "right"; x.fillText(P.head, m.W - m.right, m.top - m.lh * .35); x.textAlign = "left";
  }
  lines.forEach((ln, i) => {
    let px = m.left + R() * j * 8 * s;
    const base = m.top + (i + 1) * m.lh - m.fs * .12, drift = (R() - .5) * j * m.fs * .12;
    ln.forEach((w, k) => {
      if (k) px += sp * (1 + (R() - .5) * j * .6);
      x.save(); x.translate(px, base + drift + (R() - .5) * j * m.fs * .14);
      x.rotate((R() - .5) * j * .06); x.globalAlpha = .86 + R() * .14;
      x.fillText(w.t, 0, 0); x.restore(); px += w.w;
    });
  });
  x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
  return cv;
}

function finish(paper, m, P, R) {
  if (P.fx === "bersih") return paper;
  const { W, H, s } = m, x = paper.getContext("2d");
  let g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(255,255,255,.18)"); g.addColorStop(1, "rgba(0,0,0,.14)");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .8);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.18)");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const grain = c => { c.globalCompositeOperation = "overlay"; c.fillStyle = c.createPattern(noiseTile(R), "repeat"); };
  grain(x); x.globalAlpha = .14; x.fillRect(0, 0, W, H);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
  if (P.fx === "foto") return paper;
  const pad = Math.round(W * .07), out = document.createElement("canvas");
  out.width = W + pad * 2; out.height = H + pad * 2;
  const o = out.getContext("2d");
  o.fillStyle = "#5f4b38"; o.fillRect(0, 0, out.width, out.height);
  grain(o); o.globalAlpha = .3; o.fillRect(0, 0, out.width, out.height);
  o.globalAlpha = 1; o.globalCompositeOperation = "source-over";
  o.save(); o.translate(out.width / 2, out.height / 2); o.rotate((R() - .5) * .035);
  o.shadowColor = "rgba(0,0,0,.45)"; o.shadowBlur = 30 * s; o.shadowOffsetY = 12 * s;
  o.drawImage(paper, -W / 2, -H / 2); o.restore();
  return out;
}

let seed = 7, token = 0, timer, pages = [];

async function render() {
  const id = ++token, P = read(), box = $("pages");
  if (!P.text.trim()) { box.innerHTML = '<p class="msg">Tempel teks di kolom kiri, hasilnya muncul di sini.</p>'; pages = []; return; }
  try { await document.fonts.load(`${P.fs}px "${P.font}"`, "Abc"); } catch (e) { /* pakai font cadangan */ }
  if (id !== token) return;
  const m = metrics(P), lines = wrap(P, m), per = Math.floor((m.H - m.top - m.bottom) / m.lh);
  const out = [];
  for (let i = 0, p = 0; i < lines.length || !out.length; i += per, p++) {
    const R = rng(seed * 1000 + p);
    out.push(finish(drawPage(lines.slice(i, i + per), m, P, R, p === 0), m, P, R));
  }
  pages = out; box.innerHTML = "";
  out.forEach((cv, i) => {
    const fig = document.createElement("figure"), cap = document.createElement("figcaption"), b = document.createElement("button");
    cap.textContent = `Halaman ${i + 1} dari ${out.length}`; b.textContent = "Unduh"; b.type = "button";
    b.onclick = () => save(cv, i + 1); cap.append(b); fig.append(cv, cap); box.append(fig);
  });
}

function save(cv, n) {
  const png = $("fmt").value === "png";
  cv.toBlob(b => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = `deli-halaman-${n}.${png ? "png" : "jpg"}`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, png ? "image/png" : "image/jpeg", .92);
}

document.querySelectorAll("[data-live]").forEach(e => e.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 350); }));
$("shuffle").onclick = () => { seed++; render(); };
$("dl").onclick = () => pages.forEach((cv, i) => setTimeout(() => save(cv, i + 1), i * 500));
render();
