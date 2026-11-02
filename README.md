# Nick Fleuren Open – programma & uitslagen

- `index.html` – pagina voor bezoekers (telefoon/computer): dagkeuze, filter per onderdeel, zoeken op naam.
- `scherm.html` – tv-weergave voor de kantine (wisselt automatisch: Nu op de baan / Uitslagen / Programma).
- `config.js` – hier staat de link naar de gepubliceerde Google Sheet (CSV).
- `wedstrijden.csv` – programma volgens de KNLTB; wordt gebruikt zolang er geen sheet-link is.

## Uitslagen tijdens het toernooi
De uitslagen worden ingevoerd in Tournament Planner en komen op MijnKNLTB.
Het programma `uitslagen-sync` (staat niet in deze repository, bevat de GitHub-sleutel) leest
elke 6 minuten MijnKNLTB uit en werkt `wedstrijden.csv` hier bij.
