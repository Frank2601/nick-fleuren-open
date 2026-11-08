// Gedeeld door index.html en scherm.html: wedstrijden ophalen en inlezen.
// Kolommen (eerste rij): Datum, Onderdeel, Ronde, Tijd, Baan, Speler1, Speler2, Uitslag, Status, Winnaar
//  - Status: Gepland / Bezig / Gespeeld (leeg = met uitslag Gespeeld, anders Gepland)
//  - Winnaar: 1 of 2 (maakt de winnaar vetgedrukt)
//  - Datum: dd-mm-jjjj

function parseCSV(tekst) {
  const rijen = []; let rij = [], veld = "", inQuotes = false;
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (inQuotes) {
      if (c === '"' && tekst[i + 1] === '"') { veld += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else veld += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { rij.push(veld); veld = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && tekst[i + 1] === "\n") i++;
      rij.push(veld); rijen.push(rij); rij = []; veld = "";
    } else veld += c;
  }
  if (veld || rij.length) { rij.push(veld); rijen.push(rij); }
  const kop = (rijen.shift() || []).map(k => k.replace(/^﻿/, "").trim().toLowerCase());
  return rijen.filter(r => r.some(v => v.trim())).map(r =>
    Object.fromEntries(kop.map((k, i) => [k, (r[i] || "").trim()])));
}

function normaliseer(w, i) {
  let status = (w.status || "").toLowerCase();
  if (!status) status = w.uitslag ? "gespeeld" : "gepland";
  if (status.startsWith("bez") || status === "live") status = "bezig";
  else if (status.startsWith("gesp") || status.startsWith("klaar")) status = "gespeeld";
  else status = "gepland";
  // Walkover: MijnKNLTB geeft dan wel een winnaar door, maar geen uitslag
  const walkover = status === "gespeeld" && !w.uitslag && (w.winnaar === "1" || w.winnaar === "2");
  return { ...w, status, walkover, volgnr: i };
}

// Tekst die in plaats van setstanden getoond wordt (bijv. "Walkover" of "w.o."), anders ""
const uitslagTekst = w => w.walkover ? "Walkover" : sets(w.uitslag) ? "" : (w.uitslag || "");

const tijdSleutel = t => { const m = /(\d{1,2})[:.](\d{2})/.exec(t || ""); return m ? m[1] * 60 + +m[2] : 9999; };

const vandaag = () => {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
};

// "6-4 3-6 10-7" → [[6,4],[3,6],[10,7]]; null als de uitslag geen gewone setstand is (bijv. walkover)
function sets(uitslag) {
  const delen = (uitslag || "").trim().split(/\s+/).filter(Boolean);
  if (!delen.length || delen.length > 3) return null;
  const s = delen.map(d => /^(\d+)-(\d+)$/.exec(d)).filter(Boolean).map(m => [+m[1], +m[2]]);
  return s.length === delen.length ? s : null;
}

// dd-mm-jjjj → sorteerbare sleutel jjjjmmdd
const datumSleutel = d => d.split("-").reverse().join("");

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Haalt de wedstrijden op: eerst de Google Sheet (config.js), anders wedstrijden.csv.
// Geeft { wedstrijden, bijgewerkt } terug; bijgewerkt = "HH:MM" van de laatste wijziging (indien bekend).
async function laadWedstrijden(csvUrl) {
  const url = csvUrl || "wedstrijden.csv";
  const r = await fetch(url + (url.includes("?") ? "&" : "?") + "_=" + Date.now(), { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const wedstrijden = parseCSV(await r.text()).map(normaliseer).filter(w => w.speler1 || w.speler2);
  const lm = r.headers.get("last-modified");
  const bijgewerkt = lm && !isNaN(new Date(lm))
    ? new Date(lm).toLocaleString("nl-NL", { weekday: "short", hour: "2-digit", minute: "2-digit" }) : "";
  return { wedstrijden, bijgewerkt };
}
