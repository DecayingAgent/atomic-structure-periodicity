"use client";

export const dynamic = "force-static";

import { useMemo, useState } from "react";
import {
  formatScientific,
  hydrogenEnergy,
  hydrogenTransition,
  photonEnergy,
  quantumNumbersAreValid,
  visibleColorAtWavelength,
  VISIBLE_SPECTRUM_GRADIENT,
  wavelengthToFrequency,
} from "./chapter7-utils";

export type SectionId =
  | "overview"
  | "light"
  | "hydrogen"
  | "orbitals"
  | "configuration"
  | "trends"
  | "alkali"
  | "quiz";

export type TrendId = "ionization" | "radius" | "affinity";

export type ElementRecord = {
  symbol: string;
  name: string;
  atomicNumber: number;
  period: number;
  group: number;
  category: string;
  configuration: string;
  valence: string;
};

export type OrbitalSpec = {
  label: string;
  l: number;
  capacity: number;
  shape: string;
  description: string;
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const NAV_ITEMS: Array<{ id: SectionId; label: string; eyebrow: string }> = [
  { id: "overview", label: "Mission map", eyebrow: "01" },
  { id: "light", label: "Light lab", eyebrow: "02" },
  { id: "hydrogen", label: "Hydrogen", eyebrow: "03" },
  { id: "orbitals", label: "Orbitals", eyebrow: "04" },
  { id: "configuration", label: "Configurations", eyebrow: "05" },
  { id: "trends", label: "Trend scanner", eyebrow: "06" },
  { id: "alkali", label: "Alkali metals", eyebrow: "07" },
  { id: "quiz", label: "Checkpoint", eyebrow: "08" },
];

const ORBITALS: OrbitalSpec[] = [
  { label: "s", l: 0, capacity: 2, shape: "sphere", description: "One spherical region around the nucleus." },
  { label: "p", l: 1, capacity: 6, shape: "dumbbell", description: "Three orientations, each shaped like a two-lobed dumbbell." },
  { label: "d", l: 2, capacity: 10, shape: "clover", description: "Five orientations; most have four lobes." },
  { label: "f", l: 3, capacity: 14, shape: "flower", description: "Seven orientations with more complex multi-lobed shapes." },
];

const ELEMENTS: ElementRecord[] = [
  { symbol: "H", name: "Hydrogen", atomicNumber: 1, period: 1, group: 1, category: "nonmetal", configuration: "1s¹", valence: "1s¹" },
  { symbol: "He", name: "Helium", atomicNumber: 2, period: 1, group: 18, category: "noble gas", configuration: "1s²", valence: "1s²" },
  { symbol: "C", name: "Carbon", atomicNumber: 6, period: 2, group: 14, category: "nonmetal", configuration: "[He] 2s² 2p²", valence: "2s² 2p²" },
  { symbol: "N", name: "Nitrogen", atomicNumber: 7, period: 2, group: 15, category: "nonmetal", configuration: "[He] 2s² 2p³", valence: "2s² 2p³" },
  { symbol: "O", name: "Oxygen", atomicNumber: 8, period: 2, group: 16, category: "nonmetal", configuration: "[He] 2s² 2p⁴", valence: "2s² 2p⁴" },
  { symbol: "Na", name: "Sodium", atomicNumber: 11, period: 3, group: 1, category: "alkali metal", configuration: "[Ne] 3s¹", valence: "3s¹" },
  { symbol: "Cl", name: "Chlorine", atomicNumber: 17, period: 3, group: 17, category: "halogen", configuration: "[Ne] 3s² 3p⁵", valence: "3s² 3p⁵" },
  { symbol: "K", name: "Potassium", atomicNumber: 19, period: 4, group: 1, category: "alkali metal", configuration: "[Ar] 4s¹", valence: "4s¹" },
  { symbol: "Cr", name: "Chromium", atomicNumber: 24, period: 4, group: 6, category: "transition metal", configuration: "[Ar] 4s¹ 3d⁵", valence: "4s¹ 3d⁵" },
  { symbol: "Cu", name: "Copper", atomicNumber: 29, period: 4, group: 11, category: "transition metal", configuration: "[Ar] 4s¹ 3d¹⁰", valence: "4s¹ 3d¹⁰" },
  { symbol: "Br", name: "Bromine", atomicNumber: 35, period: 4, group: 17, category: "halogen", configuration: "[Ar] 4s² 3d¹⁰ 4p⁵", valence: "4s² 4p⁵" },
  { symbol: "Xe", name: "Xenon", atomicNumber: 54, period: 5, group: 18, category: "noble gas", configuration: "[Kr] 5s² 4d¹⁰ 5p⁶", valence: "5s² 5p⁶" },
];

const TREND_DATA: Record<TrendId, { label: string; unit: string; direction: string; explanation: string; values: Record<string, number> }> = {
  ionization: {
    label: "First ionization energy",
    unit: "kJ/mol",
    direction: "generally increases → and ↑",
    explanation: "Across a period, effective nuclear charge grows. Down a group, added shells increase distance and shielding, so an outer electron is easier to remove.",
    values: { Li: 520, Na: 496, K: 419, C: 1086, N: 1402, O: 1314, Cl: 1251, Cr: 653, Cu: 746 },
  },
  radius: {
    label: "Atomic radius",
    unit: "relative pm",
    direction: "generally decreases → and increases ↓",
    explanation: "Moving across a period pulls the valence cloud inward. Moving down a group adds occupied energy levels, making atoms larger.",
    values: { Li: 152, Na: 186, K: 227, C: 77, N: 75, O: 73, Cl: 99, Cr: 128, Cu: 128 },
  },
  affinity: {
    label: "Electron affinity",
    unit: "kJ/mol released",
    direction: "generally more exothermic →",
    explanation: "Electron affinity reflects the energy change when a gas-phase atom gains an electron. Filled and half-filled subshells create useful exceptions to the broad trend.",
    values: { Li: 60, Na: 53, K: 48, C: 122, N: 7, O: 141, Cl: 349, Cr: 64, Cu: 119 },
  },
};

const ALKALI_METALS = [
  { symbol: "Li", name: "Lithium", radius: 152, ionization: 520, melting: 181, gas: "moderate", aqueous: "strong" },
  { symbol: "Na", name: "Sodium", radius: 186, ionization: 496, melting: 98, gas: "strong", aqueous: "stronger" },
  { symbol: "K", name: "Potassium", radius: 227, ionization: 419, melting: 64, gas: "very strong", aqueous: "strongest" },
  { symbol: "Rb", name: "Rubidium", radius: 248, ionization: 403, melting: 39, gas: "very strong", aqueous: "very strong" },
  { symbol: "Cs", name: "Cesium", radius: 265, ionization: 376, melting: 29, gas: "very strong", aqueous: "very strong" },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { prompt: "A 650 nm photon has approximately what frequency?", options: ["4.61 × 10¹⁴ Hz", "1.95 × 10⁻⁴ Hz", "2.00 × 10⁸ Hz", "6.50 × 10¹⁴ Hz"], answer: 0, explanation: "Use ν = c/λ. Convert 650 nm to 6.50 × 10⁻⁷ m, giving about 4.61 × 10¹⁴ Hz." },
  { prompt: "Which hydrogen transition emits a photon?", options: ["n = 1 → n = 2", "n = 3 → n = 2", "n = 2 → n = 4", "n = 1 → n = 5"], answer: 1, explanation: "Emission occurs when an electron falls to a lower energy level, so the final n must be smaller than the initial n." },
  { prompt: "What is the maximum number of electrons in a p subshell?", options: ["2", "6", "10", "14"], answer: 1, explanation: "A p subshell has three orbitals, and each orbital holds two electrons: 3 × 2 = 6." },
  { prompt: "Which quantum-number set is valid?", options: ["n=2, l=2, mₗ=0", "n=3, l=1, mₗ=-1", "n=1, l=0, mₗ=1", "n=3, l=3, mₗ=0"], answer: 1, explanation: "For n=3, l can be 0, 1, or 2; with l=1, mₗ can be -1, 0, or +1." },
  { prompt: "Which is the ground-state configuration of chromium?", options: ["[Ar] 4s² 3d⁴", "[Ar] 4s¹ 3d⁵", "[Ar] 4s² 3d⁵", "[Ar] 4s¹ 3d⁴"], answer: 1, explanation: "Chromium shifts one 4s electron into 3d, creating the especially stable half-filled 3d⁵ subshell." },
  { prompt: "What happens to atomic radius from Na to Cl?", options: ["It generally increases", "It generally decreases", "It stays constant", "It becomes unpredictable"], answer: 1, explanation: "Na and Cl are in the same period. Increasing effective nuclear charge pulls their valence electrons closer across the row." },
  { prompt: "Which alkali metal is easiest to ionize in the gas phase?", options: ["Li", "Na", "K", "Cs"], answer: 3, explanation: "Down Group 1, the valence electron is farther from the nucleus and more shielded; cesium has the lowest ionization energy here." },
  { prompt: "Why can aqueous reducing-power trends differ from gas-phase ionization trends?", options: ["Water never interacts with ions", "Hydration stabilizes ions differently", "Electrons have no energy", "Atomic number disappears in water"], answer: 1, explanation: "In water, hydration and other solvent effects contribute to the overall free-energy change, so gas-phase properties alone do not determine redox strength." },
];

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionHeading({ number, kicker, title, children }: { number: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="section-heading">
      <div className="section-index">{number}</div>
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        <p className="section-lede">{children}</p>
      </div>
    </div>
  );
}

function CompletionButton({ id, completed, onComplete }: { id: SectionId; completed: boolean; onComplete: (id: SectionId) => void }) {
  return <button className={`complete-button ${completed ? "is-complete" : ""}`} onClick={() => onComplete(id)} aria-pressed={completed}>{completed ? "✓ Logged in field notes" : "Mark section complete"}</button>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function OrbitalVisual({ shape }: { shape: string }) {
  return <div className={`orbital-visual shape-${shape}`} role="img" aria-label={`${shape} orbital CSS visualization`}><span /><span /><span /></div>;
}

export default function Home() {
  const [completed, setCompleted] = useState<Set<SectionId>>(new Set());
  const [wavelength, setWavelength] = useState(650);
  const [initialLevel, setInitialLevel] = useState(3);
  const [finalLevel, setFinalLevel] = useState(2);
  const [principal, setPrincipal] = useState(3);
  const [angular, setAngular] = useState(1);
  const [magnetic, setMagnetic] = useState(0);
  const [selectedOrbital, setSelectedOrbital] = useState("p");
  const [selectedElement, setSelectedElement] = useState("Cr");
  const [trend, setTrend] = useState<TrendId>("ionization");
  const [alkaliMedium, setAlkaliMedium] = useState<"gas" | "water">("gas");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const progress = Math.round((completed.size / NAV_ITEMS.length) * 100);
  const frequency = wavelengthToFrequency(wavelength);
  const energy = photonEnergy(wavelength);
  const transition = hydrogenTransition(initialLevel, finalLevel);
  const chosenOrbital = ORBITALS.find((orbital) => orbital.label === selectedOrbital) ?? ORBITALS[0];
  const quantumValid = quantumNumbersAreValid(principal, angular, magnetic);
  const element = ELEMENTS.find((item) => item.symbol === selectedElement) ?? ELEMENTS[0];
  const trendInfo = TREND_DATA[trend];
  const trendMax = Math.max(...Object.values(trendInfo.values));
  const question = QUIZ_QUESTIONS[quizIndex];
  const quizAnswered = quizChoice !== null;
  const selectedAnswerIsCorrect = quizChoice === question.answer;

  const configurationRows = useMemo(() => {
    const base = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p"];
    const electronCount = element.atomicNumber;
    let remaining = electronCount;
    const capacities: Record<string, number> = { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "4s": 2, "3d": 10, "4p": 6, "5s": 2, "4d": 10, "5p": 6 };
    return base.map((orbital) => {
      const electrons = Math.min(remaining, capacities[orbital]);
      remaining -= electrons;
      return { orbital, electrons, capacity: capacities[orbital] };
    }).filter((row) => row.electrons > 0);
  }, [element.atomicNumber]);

  function completeSection(id: SectionId) {
    setCompleted((previous) => new Set(previous).add(id));
  }

  function answerQuiz(choice: number) {
    if (quizAnswered) return;
    setQuizChoice(choice);
    if (choice === question.answer) setQuizScore((score) => score + 1);
  }

  function nextQuiz() {
    setQuizIndex((index) => (index + 1) % QUIZ_QUESTIONS.length);
    setQuizChoice(null);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="ATOM/07 home"><span className="brand-mark">07</span><span>ATOM<span className="brand-slash">/</span>07</span></a>
        <nav className="topnav" aria-label="Primary navigation">
          <button onClick={() => scrollToSection("light")}>Labs</button>
          <button onClick={() => scrollToSection("quiz")}>Checkpoint</button>
        </nav>
        <div className="progress-chip"><span>FIELD PROGRESS</span><strong>{progress}%</strong><i><b style={{ width: `${progress}%` }} /></i></div>
      </header>

      <aside className="section-nav" aria-label="Chapter navigation">
        <span className="nav-label">CHAPTER 07</span>
        {NAV_ITEMS.map((item) => <button key={item.id} onClick={() => scrollToSection(item.id)} className={completed.has(item.id) ? "visited" : ""}><span>{item.eyebrow}</span>{completed.has(item.id) ? "✓" : item.label}</button>)}
      </aside>

      <section id="overview" className="hero page-section">
        <div className="hero-copy">
          <p className="eyebrow signal"><span className="signal-dot" /> STUDY COMPANION / GENERAL CHEMISTRY</p>
          <h1>Atomic structure<br /><em>&amp; periodicity</em></h1>
          <p className="hero-intro">A hands-on field guide to the quantum ideas behind the periodic table. Tune the variables, watch the patterns emerge, and build intuition one experiment at a time.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => scrollToSection("light")}>Start the labs <span>↗</span></button><span className="readout">8 modules <b>•</b> ~25 min</span></div>
        </div>
        <div className="atom-art" aria-label="Decorative CSS atom illustration" role="img"><div className="atom-core">+</div><div className="orbit orbit-one"><i /></div><div className="orbit orbit-two"><i /></div><div className="orbit orbit-three"><i /></div><span className="atom-caption">THE<br />SMALLEST<br />STORY</span></div>
        <div className="hero-foot"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><span>c = λν &nbsp; · &nbsp; E = hν</span></div>
      </section>

      <section className="overview-grid page-section">
        <div className="overview-intro"><p className="eyebrow">YOUR MISSION</p><h2>From a beam of light<br />to a block of elements.</h2><p>Chapter 7 is a chain of evidence. Each lab connects a measurable signal to an invisible structure, then uses that structure to explain periodic behavior.</p></div>
        <div className="mission-cards">{NAV_ITEMS.slice(1, 5).map((item, index) => <button className="mission-card" key={item.id} onClick={() => scrollToSection(item.id)}><span className="card-number">0{index + 2}</span><strong>{item.label}</strong><small>{["Decode electromagnetic radiation", "Read the line spectrum", "Give orbitals a language", "Assemble atoms electron by electron"][index]}</small><span className="card-arrow">↗</span></button>)}</div>
      </section>

      <section id="light" className="lab-section page-section">
        <div className="section-wrap"><SectionHeading number="02" kicker="LAB 01 / ELECTROMAGNETIC RADIATION" title="Light is a measurement." >Wavelength and frequency are two descriptions of the same wave. Change one and the other has to answer.</SectionHeading><CompletionButton id="light" completed={completed.has("light")} onComplete={completeSection} />
          <div className="lab-grid light-grid"><div className="control-panel"><div className="panel-top"><span className="panel-tag">INPUT</span><span className="panel-value">λ <b>{wavelength}</b> nm</span></div><label htmlFor="wavelength">Wavelength <output>{wavelength} nm</output></label><input id="wavelength" type="range" min="380" max="760" step="1" value={wavelength} onChange={(event) => setWavelength(Number(event.target.value))} /><div className="range-ends"><span>380 nm / violet</span><span>760 nm / red</span></div><div className="spectrum" role="img" aria-label="Visible spectrum from violet at 380 nanometers to red at 760 nanometers" style={{ background: VISIBLE_SPECTRUM_GRADIENT }}><i style={{ left: `${((wavelength - 380) / 380) * 100}%` }} /></div><div className="formula-card"><span>THE RELATIONSHIP</span><strong>c = λν</strong><small>As λ gets longer, ν gets lower.</small></div></div><div className="result-panel"><p className="eyebrow">LIVE READOUT</p><div className="big-readout">{formatScientific(frequency)} <span>Hz</span></div><p className="readout-note">frequency ν</p><div className="metrics"><Metric label="Photon energy" value={formatScientific(energy)} detail="joules / photon" /><Metric label="Color zone" value={visibleColorAtWavelength(wavelength)} detail="visible spectrum" /></div><div className="energy-bar"><span style={{ width: `${Math.min(100, (energy / 5.2e-19) * 100)}%` }} /></div><p className="microcopy">Higher frequency means higher energy per photon.</p></div></div>
        </div>
      </section>

      <section id="hydrogen" className="dark-section page-section"><div className="section-wrap"><SectionHeading number="03" kicker="LAB 02 / QUANTIZED ENERGY" title="Hydrogen leaves fingerprints." >An electron can occupy only specific energy levels. A jump between levels creates a photon with a precise wavelength.</SectionHeading><CompletionButton id="hydrogen" completed={completed.has("hydrogen")} onComplete={completeSection} /><div className="hydrogen-grid"><div className="energy-ladder"><div className="ladder-label">ENERGY / J</div>{[1, 2, 3, 4, 5, 6].map((level) => <div className="energy-level" key={level} style={{ bottom: `${level === 1 ? 5 : 15 + (level - 2) * 14}%` }}><span>n = {level}</span><i /><small>{formatScientific(hydrogenEnergy(level))}</small></div>)}<div className="transition-line" style={{ bottom: `${15 + (initialLevel - 2) * 14}%`, height: `${Math.abs((15 + (initialLevel - 2) * 14) - (15 + (finalLevel - 2) * 14))}%` }} /><div className="nucleus-dot" /></div><div className="hydrogen-controls"><p className="eyebrow">SET A TRANSITION</p><div className="select-row"><label>Electron starts at <select value={initialLevel} onChange={(event) => setInitialLevel(Number(event.target.value))}>{[2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>n = {level}</option>)}</select></label><label>Electron ends at <select value={finalLevel} onChange={(event) => setFinalLevel(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>n = {level}</option>)}</select></label></div><div className={`transition-card ${initialLevel > finalLevel ? "emission" : "absorption"}`}><span>{initialLevel > finalLevel ? "EMISSION" : initialLevel < finalLevel ? "ABSORPTION" : "NO JUMP"}</span><strong>{initialLevel === finalLevel ? "Choose two levels" : `${Math.abs(initialLevel - finalLevel)} level ${initialLevel > finalLevel ? "drop" : "rise"}`}</strong><p>{initialLevel === finalLevel ? "An electron must change levels to exchange energy." : `${formatScientific(transition.photonEnergy)} J photon · ${transition.wavelengthNm.toFixed(1)} nm`}</p></div><div className="hydrogen-note"><b>Why lines?</b> The allowed energies are discrete, so only certain photon energies—and therefore only certain colors—can appear.</div></div></div></div></section>

      <section id="orbitals" className="lab-section page-section"><div className="section-wrap"><SectionHeading number="04" kicker="LAB 03 / QUANTUM NUMBERS" title="Orbitals are probability maps." >The four quantum numbers label an electron&apos;s address: shell, subshell, orientation, and spin. Test an address, then inspect its shape.</SectionHeading><CompletionButton id="orbitals" completed={completed.has("orbitals")} onComplete={completeSection} /><div className="orbital-grid"><div className="orbital-picker">{ORBITALS.map((orbital) => <button key={orbital.label} className={selectedOrbital === orbital.label ? "selected" : ""} onClick={() => { setSelectedOrbital(orbital.label); setAngular(orbital.l); setMagnetic(0); }}><b>{orbital.label}</b><span>l = {orbital.l}</span><small>{orbital.capacity} e⁻ max</small></button>)}</div><div className="orbital-view"><div className="orbital-stage"><OrbitalVisual shape={chosenOrbital.shape} /><div className="orbital-axis axis-x" /><div className="orbital-axis axis-y" /></div><div><p className="eyebrow">{chosenOrbital.label.toUpperCase()} SUBSHELL / l = {chosenOrbital.l}</p><h3>{chosenOrbital.description}</h3><p className="soft-copy">A subshell with angular momentum quantum number <b>l = {chosenOrbital.l}</b> contains {2 * chosenOrbital.l + 1} orbital{chosenOrbital.l === 0 ? "" : "s"} and holds up to {chosenOrbital.capacity} electrons.</p></div></div><div className="validator"><div className="validator-head"><span>ADDRESS VALIDATOR</span><strong className={quantumValid ? "valid" : "invalid"}>{quantumValid ? "VALID ADDRESS" : "INVALID ADDRESS"}</strong></div><div className="quantum-inputs"><label>n <input type="number" min="1" max="7" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} /></label><label>l <input type="number" min="0" max="6" value={angular} onChange={(event) => setAngular(Number(event.target.value))} /></label><label>mₗ <input type="number" min="-3" max="3" value={magnetic} onChange={(event) => setMagnetic(Number(event.target.value))} /></label></div><p>{quantumValid ? `Allowed: l = 0…${principal - 1}; for this l, mₗ ranges from −${angular} to +${angular}.` : `Check the rules: l must be 0 through n−1, and mₗ must be between −l and +l.`}</p></div></div></div></section>

      <section id="configuration" className="dark-section page-section"><div className="section-wrap"><SectionHeading number="05" kicker="LAB 04 / ELECTRON CONFIGURATIONS" title="Build the address book." >Fill orbitals in the right order, never pair electrons too early, and remember that a few atoms trade energy for extra stability.</SectionHeading><CompletionButton id="configuration" completed={completed.has("configuration")} onComplete={completeSection} /><div className="configuration-grid"><div className="element-selector"><p className="eyebrow">SELECT AN ELEMENT</p><div className="element-buttons">{ELEMENTS.map((item) => <button key={item.symbol} className={selectedElement === item.symbol ? "selected" : ""} onClick={() => setSelectedElement(item.symbol)}><b>{item.symbol}</b><span>{item.atomicNumber}</span></button>)}</div><div className="selected-element"><span className="element-symbol">{element.symbol}</span><div><strong>{element.name}</strong><small>Z = {element.atomicNumber} · period {element.period} · group {element.group}</small><em>{element.category}</em></div></div></div><div className="configuration-readout"><p className="eyebrow">GROUND-STATE CONFIGURATION</p><div className="configuration-string">{element.configuration}</div><div className="orbital-boxes">{configurationRows.map((row) => <div className="orbital-box" key={row.orbital}><span>{row.orbital}</span><div>{Array.from({ length: row.capacity / 2 }, (_, index) => <i key={index} className={index < Math.ceil(row.electrons / 2) ? "filled" : ""}>{index < row.electrons ? (index % 2 === 0 ? "↑" : "↓") : ""}</i>)}</div><small>{row.electrons}/{row.capacity}</small></div>)}</div><div className="rule-strip"><span><b>AUFBAU</b> lowest energy first</span><span><b>PAULI</b> max two, opposite spins</span><span><b>HUND</b> spread before pairing</span></div>{(selectedElement === "Cr" || selectedElement === "Cu") && <div className="exception-callout"><b>{selectedElement} exception detected</b><span>{selectedElement === "Cr" ? "A half-filled 3d⁵ subshell is favored: [Ar] 4s¹ 3d⁵." : "A filled 3d¹⁰ subshell is favored: [Ar] 4s¹ 3d¹⁰."}</span></div>}</div></div></div></section>

      <section id="trends" className="lab-section page-section"><div className="section-wrap"><SectionHeading number="06" kicker="LAB 05 / PERIODIC PATTERNS" title="The table is a map of forces." >Effective nuclear charge, shielding, and distance turn atomic properties into repeatable patterns—with small, important exceptions.</SectionHeading><CompletionButton id="trends" completed={completed.has("trends")} onComplete={completeSection} /><div className="trend-tabs" role="tablist" aria-label="Periodic trend properties">{(Object.keys(TREND_DATA) as TrendId[]).map((id) => <button role="tab" aria-selected={trend === id} className={trend === id ? "selected" : ""} key={id} onClick={() => setTrend(id)}>{TREND_DATA[id].label}</button>)}</div><div className="trend-dashboard"><div className="trend-copy"><span className="trend-direction">{trendInfo.direction}</span><h3>{trendInfo.label}</h3><p>{trendInfo.explanation}</p><div className="trend-legend"><span><i className="legend-dot across" />across a period</span><span><i className="legend-dot down" />down a group</span></div></div><div className="trend-bars" aria-label={`${trendInfo.label} comparison chart`}>{Object.entries(trendInfo.values).map(([symbol, value]) => <div className="bar-row" key={symbol}><span>{symbol}</span><div><i style={{ width: `${(value / trendMax) * 100}%` }} /></div><small>{value} {trendInfo.unit}</small></div>)}</div></div></div></section>

      <section id="alkali" className="dark-section page-section"><div className="section-wrap"><SectionHeading number="07" kicker="CASE STUDY / ALKALI METALS" title="Context changes the winner." >A gas-phase property is not the whole story. In water, solvation stabilizes ions and can reshape the apparent reducing power of Group 1 metals.</SectionHeading><CompletionButton id="alkali" completed={completed.has("alkali")} onComplete={completeSection} /><div className="case-study-top"><div><p className="eyebrow">COMPARE THE MEDIUM</p><div className="segmented"><button className={alkaliMedium === "gas" ? "active" : ""} onClick={() => setAlkaliMedium("gas")}>Gas phase</button><button className={alkaliMedium === "water" ? "active" : ""} onClick={() => setAlkaliMedium("water")}>Aqueous context</button></div></div><p className="case-study-explanation">{alkaliMedium === "gas" ? "In the gas phase, lower ionization energy generally means an easier electron donor down the group." : "In water, hydration of the resulting cation adds a major energetic term. The strongest practical reducer is a balance of ionization and solvation."}</p></div><div className="alkali-table"><div className="alkali-table-head"><span>METAL</span><span>ATOMIC RADIUS</span><span>1ST IONIZATION</span><span>REDUCING POWER / {alkaliMedium === "gas" ? "GAS" : "WATER"}</span></div>{ALKALI_METALS.map((metal, index) => <div className="alkali-row" key={metal.symbol}><strong><i style={{ opacity: 1 - index * 0.12 }} />{metal.symbol}<small>{metal.name}</small></strong><span>{metal.radius} <small>pm</small></span><span>{metal.ionization} <small>kJ/mol</small></span><span className="power"><b style={{ width: `${alkaliMedium === "gas" ? 38 + index * 14 : 68 + (index === 2 ? 20 : index * 4)}%` }} />{alkaliMedium === "gas" ? metal.gas : metal.aqueous}</span></div>)}</div><p className="footnote">The table is a conceptual comparison, not a single universal ranking: thermodynamic medium and reaction partner matter.</p></div></section>

      <section id="quiz" className="quiz-section page-section"><div className="section-wrap"><SectionHeading number="08" kicker="CHECKPOINT / RETRIEVAL PRACTICE" title="Prove it to yourself." >Eight quick questions. Commit to an answer before the explanation appears, then use the miss as a map for what to revisit.</SectionHeading><CompletionButton id="quiz" completed={completed.has("quiz")} onComplete={completeSection} /><div className="quiz-card"><div className="quiz-progress"><span>QUESTION {String(quizIndex + 1).padStart(2, "0")} / {String(QUIZ_QUESTIONS.length).padStart(2, "0")}</span><strong>{quizScore} correct</strong></div><div className="quiz-question"><p>{question.prompt}</p><div className="quiz-options">{question.options.map((option, index) => <button key={option} disabled={quizAnswered} className={quizAnswered ? index === question.answer ? "correct" : index === quizChoice ? "incorrect" : "" : ""} onClick={() => answerQuiz(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{quizAnswered && index === question.answer && <b>✓</b>}{quizAnswered && index === quizChoice && index !== question.answer && <b>×</b>}</button>)}</div>{quizAnswered && <div className={`answer-explanation ${selectedAnswerIsCorrect ? "correct" : "incorrect"}`}><strong>{selectedAnswerIsCorrect ? "Correct read." : "Not quite."}</strong><p>{question.explanation}</p></div>}</div><div className="quiz-footer"><span>{quizAnswered ? "Answer logged" : "Select one answer"}</span><button className="primary-button small" onClick={nextQuiz}>{quizIndex === QUIZ_QUESTIONS.length - 1 ? "Restart checkpoint" : "Next question"} <span>→</span></button></div></div><div className="final-note"><span>CHAPTER 07 / END OF TRANSMISSION</span><strong>Keep asking what the electron is allowed to do.</strong></div></div></section>
    </main>
  );
}
