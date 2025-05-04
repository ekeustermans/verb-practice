import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Franse subject‑pronouns per persoon
const PRONOUNS = {
  "je": ["je", "j'"],
  "tu": ["tu"],
  "il": ["il", "elle", "on"],
  "elle": ["il", "elle", "on"],
  "on": ["il", "elle", "on"],
  "nous": ["nous"],
  "vous": ["vous"],
  "ils": ["ils", "elles"],
  "elles": ["ils", "elles"],
};

/**
 * ============================
 * 📚  VerbPracticeApp.jsx
 * ----------------------------
 * Interactieve oefentool voor de vervoeging van Franse werkwoorden –
 * afgestemd op de leerplandoelen van de 1ste graad A‑stroom.
 *
 * ✦ Functionaliteit
 *   • Setup‑scherm om oefen­modus te kiezen (één tijd / gemengd) en gewenste series aan te vinken.
 *   • Oefenscherm met invulveld, directe feedback (✅ / ❌ + tip) en scoreteller.
 *   • Willekeurige volgorde AAN/UIT (shuffle‑icoon).
 *   • Géén weergave van het juiste antwoord – alleen hints.
 *
 * 🛠️  Data‑inname
 *   Laad een JSON‑bestand met de kolommen
 *     [{ infinitief, tijd, persoon, correcte, serie }]
 *   Exporteer bv. het meegeleverde Excel‑bestand naar
 *   public/verb_conjugations.json met onderstaand Python‑fragment:
 *   >>> import pandas as pd, json
 *   >>> df = pd.read_excel("verb_conjugations.xlsx")
 *   >>> df.rename(columns={"correct antwoord": "correcte"}, inplace=True)
 *   >>> df.to_json("public/verb_conjugations.json", orient="records", force_ascii=False)
 */

export default function VerbPracticeApp() {
  const [rawData, setRawData] = useState([]);
  const [step, setStep] = useState("setup"); // "setup" | "practice"
  const [selectedTenses, setSelectedTenses] = useState([]); // array of tijd
  const [selectedSeries, setSelectedSeries] = useState([]); // array of serie
  const [shuffle, setShuffle] = useState(true);

  // practice state
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);

  /* ---------------- Data loading ---------------- */
  useEffect(() => {
    fetch("/verb_conjugations.json")
      .then((r) => r.json())
      .then(setRawData)
      .catch(() => console.error("Kon het dataset-bestand niet laden."));
  }, []);

  /* ----------------  Filters & pool  ---------------- */
  const pool = useMemo(() => {
    let filtered = rawData;
    if (selectedTenses.length) filtered = filtered.filter((r) => selectedTenses.includes(r.tijd));
    if (selectedSeries.length) filtered = filtered.filter((r) => selectedSeries.includes(r.serie));
    return shuffle ? shuffleArray(filtered) : filtered;
    // eslint-disable-next-line
  }, [rawData, selectedTenses, selectedSeries, shuffle]);

  const current = pool[index] || null;
  console.log("⮕ pool length:", pool.length, "filters:", {
    tenses: selectedTenses,
    series: selectedSeries,
  });
  

  /* ----------------  Handlers  ---------------- */
  function handleSubmit(e) {
    e.preventDefault();
    if (!current) return;
    const isCorrect =
  normalise(input, current.persoon) === normalise(current.correcte);
    setFeedback(isCorrect ? "correct" : "wrong");
    setAttempts((a) => a + 1);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setTimeout(() => {
        nextQuestion();
      }, 800);
    }
  }

  function nextQuestion() {
    setFeedback(null);
    setInput("");
    setIndex((i) => (i + 1) % pool.length);
  }

  /* ----------------  Util-helpers  ---------------- */
  const normalise = (str = "", pronoun = "") => {
    let txt = str.trim().toLowerCase();
  
    // ❐ pronoun in antwoord?  strip het indien aanwezig
    if (pronoun && PRONOUNS[pronoun]) {
      for (const p of PRONOUNS[pronoun]) {
        if (txt.startsWith(p + " ")) {
          txt = txt.slice(p.length).trim();    // "tu viens"  → "viens"
          break;
        }
      }
    }
    return txt;
  };
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;

  function shuffleArray(arr) {
    if (!shuffle) return arr;
    return [...arr].sort(() => Math.random() - 0.5);
  }
/* ----------------  Page header  ---------------- */
const Heading = () => (
  <div className="text-center my-6 space-y-2">
    <h1 className="text-2xl font-extrabold">
      Atelier&nbsp;de&nbsp;conjugaison — Werkwoorden oefenen
    </h1>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Oefen Franse werkwoorden in de gekozen tijd(en). Typ de juiste vorm
      en krijg direct feedback. Je moet het onderwerp niet overtypen. Het werkwoord is voldoende. Bonne chance !
    </p>
  </div>
);

/* ----------------  Rendering  ---------------- */
// … alle hooks en helpers …

/* ----------------  Rendering  ---------------- */
return (
  <>
    <Heading />
    {step === "setup" ? (
      <SetupScreen />
    ) : !current ? (
      <div className="p-6">Chargement…</div>
    ) : (
      renderPractice()
    )}
  </>
);

/* === renderPractice M O E T hier nog binnen de component === */
function renderPractice() {
  return (
    <Card className="max-w-xl mx-auto mt-8 p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {current.tijd} — <span className="italic">{current.infinitief}</span> ▸ {current.persoon}
        </h1>
        <Button variant="ghost" size="icon" onClick={() => setShuffle((s) => !s)} title="Ordre aléatoire">
          <Shuffle className={shuffle ? "text-primary" : "opacity-30"} />
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="flex space-x-4">
  <input
    autoFocus
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Tape ta réponse ici…"
    className="flex-1 border rounded-xl h-24 p-4 text-2xl focus:outline-none focus:ring"
  />
 <Button type="submit" className="h-16 text-xl px-8">
  OK
</Button>
</form>


      {feedback && (
        <div className="flex items-center space-x-2 text-lg">
          {feedback === "correct" ? (
            <CheckCircle className="text-green-600" />
          ) : (
            <XCircle className="text-red-600" />
          )}
          <span>
            {feedback === "correct" ? "Correct !" : getTip(current)}
          </span>
        </div>
      )}

      <ScoreBoard correct={correct} attempts={attempts} />
    </Card>
  );
}                // ← sluit renderPractice



  /* ----------------  Sub-components  ---------------- */
  function SetupScreen() {
    // haal unieke lijsten
    const tenses = [...new Set(rawData.map((r) => r.tijd))];
    const series = [...new Set(rawData.map((r) => r.serie))];

    const [singleTense, setSingleTense] = useState(false);

    return (
      <Card className="max-w-xl mx-auto mt-10 p-8 space-y-6">
        <h2 className="text-2xl font-bold mb-2">Avant de commencer…</h2>

        {/* 1️⃣ Choix du mode */}
        <div>
          <p className="mb-2 font-medium">Veux-tu exercer ?</p>
          <label className="flex items-center space-x-2 mb-1">
            <input
              type="radio"
              name="mode"
              checked={singleTense}
              onChange={() => setSingleTense(true)}
            />
            <span>Une seule forme verbale</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="mode"
              checked={!singleTense}
              onChange={() => setSingleTense(false)}
            />
            <span>Toutes les formes mélangées</span>
          </label>
        </div>

        {/* 2️⃣ Sélection des temps */}
        {singleTense && (
          <div>
            <p className="mb-2 font-medium">Choisis le temps :</p>
            {tenses.map((t) => (
              <label key={t} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={selectedTenses.includes(t)}
                  onChange={(e) => {
                    setSelectedTenses((sel) =>
                      e.target.checked ? [...sel, t] : sel.filter((s) => s !== t)
                    );
                  }}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        )}

        {/* 3️⃣ Sélection des séries */}
        <div>
          <p className="mb-2 font-medium">Quelle(s) série(s) veux-tu exercer ?</p>
          {series.map((s) => (
            <label key={s} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={selectedSeries.includes(s)}
                onChange={(e) => {
                  setSelectedSeries((sel) =>
                    e.target.checked ? [...sel, s] : sel.filter((x) => x !== s)
                  );
                }}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>

        <Button
          disabled={!rawData.length || (singleTense && !selectedTenses.length)}
          onClick={() => setStep("practice")}
          className="w-full text-lg py-6"
        >
          Commencer !
        </Button>
      </Card>
    );
  }
}

/* Score-component ---------------- */
function ScoreBoard({ correct, attempts }) {
  const errors = attempts - correct;                     // nieuw
  const percentage = attempts ? Math.round((correct / attempts) * 100) : 0;

  return (
    <CardContent className="flex justify-between items-center bg-gray-50 rounded-xl p-4 mt-4 text-sm">
      <span>✅ Juist : {correct}</span>
      <span>❌ Fout : {errors}</span>                     {/* nieuw */}
      <span>🎯 Score : {percentage}%</span>
    </CardContent>
  );
}

/* Hint-generator (rudimentaire) ---- */
function getTip({ infinitief, tijd, correcte }) {
  // Ne révèle PAS la réponse !  Indice générique.
  if (tijd.includes("présent")) return "Regarde bien la terminaison au présent.";
  if (tijd.includes("futur proche")) return "Souviens‑toi: aller (au présent) + infinitif !";
  if (tijd.includes("passé composé"))
    return "Pense à l'auxiliaire être/avoir et au participe passé !";
  if (tijd.includes("imparfait")) return "N'oublie pas la terminaison en -ais, -ait, etc.";
  if (tijd.includes("futur simple")) return "Ajoute les terminaisons du futur simple (“-ai, -as…”).";
  return "Réfléchis à la terminaison correcte.";
}
