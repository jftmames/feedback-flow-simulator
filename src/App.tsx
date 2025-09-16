import React, { useMemo, useState } from "react";
import { Brain, RefreshCcw, TrendingUp, Droplets, Rocket } from "lucide-react";

/* ---------- Utilidades ---------- */
const pct = (x: number) => `${x.toFixed(1)}%`;
const fmt = (x: number) => x.toLocaleString(undefined, { maximumFractionDigits: 0 });
const money = (x: number) => `€${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/* ---------- Controles ---------- */
function NumberSlider({
  label, value, setValue, min, max, step, suffix
}: {
  label: string; value: number; setValue: (v: number) => void;
  min: number; max: number; step: number; suffix?: string;
}) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-2">
      <div className="col-span-12 sm:col-span-3 text-sm text-gray-700">
        <span className="font-medium">{label}</span>
      </div>
      <div className="col-span-8 sm:col-span-7">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="col-span-4 sm:col-span-2 text-right text-sm font-mono">
        {suffix ? `${value}${suffix}` : value}
      </div>
    </div>
  );
}

function Toggle({
  label, checked, onChange, hint
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {hint && <div className="text-xs text-gray-500">{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

/* ---------- Diagrama ---------- */
function FlowDiagram({ feedback }: { feedback: boolean }) {
  return (
    <svg viewBox="0 0 800 220" className="w-full">
      {[
        { x: 60, y: 110, t: "Cadena de\nSuministro" },
        { x: 260, y: 110, t: "Operaciones" },
        { x: 460, y: 110, t: "Logística" },
        { x: 660, y: 110, t: "Finanzas" },
      ].map((n, i) => (
        <g key={i}>
          <rect
            x={n.x - 80} y={n.y - 35} width={160} height={70} rx={14}
            className="fill-white stroke-gray-300"
          />
          <text
            x={n.x} y={n.y} textAnchor="middle"
            className="fill-gray-800 text-[14px] font-medium whitespace-pre"
          >
            {n.t}
          </text>
        </g>
      ))}

      {/* Flechas forward */}
      {[{ x1: 140, x2: 220 }, { x1: 340, x2: 420 }, { x1: 540, x2: 620 }].map((a, i) => (
        <g key={i} className="opacity-80">
          <line x1={a.x1} y1={110} x2={a.x2} y2={110} className="stroke-gray-400" strokeWidth={3} />
          <polygon points={`${a.x2},110 ${a.x2 - 10},105 ${a.x2 - 10},115`} className="fill-gray-400" />
        </g>
      ))}

      {/* Flechas feedback */}
      {feedback &&
        [
          { x1: 620, x2: 540 },
          { x1: 420, x2: 340 },
          { x1: 220, x2: 140 },
        ].map((a, i) => (
          <g key={`b${i}`} className="opacity-90">
            <path
              d={`M ${a.x1} 140 C ${(a.x1 + a.x2) / 2} 180, ${(a.x1 + a.x2) / 2} 180, ${a.x2} 140`}
              className="fill-none stroke-emerald-600"
              strokeWidth={3}
            />
            <polygon
              points={`${a.x2},140 ${a.x2 + 10},145 ${a.x2 + 10},135`}
              className="fill-emerald-600"
            />
          </g>
        ))}

      {feedback && (
        <g>
          <text x={400} y={200} textAnchor="middle" className="fill-emerald-700 text-[12px]">
            Retroalimentación financiera activa
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---------- Cálculo de KPIs ---------- */
function computeKPIs(params: {
  ventas: number; mpPct: number; moPct: number; logPct: number; opexPct: number;
  dio: number; dso: number; dpo: number; activosFijos: number; tasaImpuesto: number;
}) {
  const { ventas, mpPct, moPct, logPct, opexPct, dio, dso, dpo, activosFijos, tasaImpuesto } = params;

  const cogs = (ventas * (mpPct + moPct + logPct)) / 100;
  const margenBruto = (ventas - cogs) / ventas;

  const opex = ventas * (opexPct / 100);
  const ebit = ventas - cogs - opex;
  const margenOperativo = ebit / ventas;

  // CCC / Capital de trabajo (aprox.)
  const cogsDia = cogs / 365;
  const ventasDia = ventas / 365;
  const inventario = cogsDia * dio;
  const cuentasCobrar = ventasDia * dso;
  const cuentasPagar = cogsDia * dpo;
  const capitalTrabajo = inventario + cuentasCobrar - cuentasPagar;
  const ccc = dio + dso - dpo;

  // ROI
  const beneficioNeto = ebit * (1 - tasaImpuesto);
  const inversionTotal = Math.max(0, activosFijos + capitalTrabajo);
  const roi = inversionTotal > 0 ? beneficioNeto / inversionTotal : 0;

  return {
    ventas, cogs, opex, ebit, margenBruto, margenOperativo,
    inventario, cuentasCobrar, cuentasPagar, capitalTrabajo, ccc,
    beneficioNeto, inversionTotal, roi,
  };
}

/* =========================================
   =============== APP =====================
   ========================================= */
export default function App() {
  // Entradas base
  const [ventas, setVentas] = useState(5_000_000);
  const [mpPct, setMpPct] = useState(32);
  const [moPct, setMoPct] = useState(18);
  const [logPct, setLogPct] = useState(7);
  const [opexPct, setOpexPct] = useState(16);
  const [dio, setDio] = useState(60);
  const [dso, setDso] = useState(45);
  const [dpo, setDpo] = useState(35);
  const [activosFijos, setActivosFijos] = useState(2_000_000);
  const [tasaImpuesto, setTasaImpuesto] = useState(0.25);

  // Palancas
  const [fb, setFb] = useState(true);
  const [negProveedores, setNegProveedores] = useState(true);
  const [optProduccion, setOptProduccion] = useState(true);
  const [optLogistica, setOptLogistica] = useState(true);
  const [jit, setJit] = useState(true);
  const [mejoraCobro, setMejoraCobro] = useState(true);
  const [mejoraPago, setMejoraPago] = useState(true);
  const [mantenimiento, setMantenimiento] = useState(true);
  const [mixMargen, setMixMargen] = useState(false);

  // Cálculo base
  const base = useMemo(
    () => computeKPIs({
      ventas, mpPct, moPct, logPct, opexPct, dio, dso, dpo, activosFijos, tasaImpuesto
    }),
    [ventas, mpPct, moPct, logPct, opexPct, dio, dso, dpo, activosFijos, tasaImpuesto]
  );

  // Cálculo con mejoras
  const tuned = useMemo(() => {
    let _mp = mpPct, _mo = moPct, _log = logPct, _opx = opexPct;
    let _dio = dio, _dso = dso, _dpo = dpo, _af = activosFijos;

    if (fb) {
      if (negProveedores) _mp = Math.max(0, _mp * 0.95);
      if (optProduccion) { _mo = Math.max(0, _mo * 0.95); _opx = Math.max(0, _opx * 0.97); }
      if (optLogistica) _log = Math.max(0, _log * 0.90);
      if (jit) _dio = Math.max(0, Math.round(_dio * 0.70));
      if (mejoraCobro) _dso = Math.max(0, Math.round(_dso * 0.80));
      if (mejoraPago) _dpo = Math.max(0, Math.round(_dpo * 1.15));
      if (mantenimiento) _af = Math.max(0, Math.round(_af * 0.90));
    }
    if (fb && mixMargen) {
      const cogsPct = _mp + _mo + _log;
      const reducido = Math.max(0, cogsPct - 2);
      const factor = reducido / Math.max(1e-6, cogsPct);
      _mp *= factor; _mo *= factor; _log *= factor;
    }

    return computeKPIs({
      ventas, mpPct: _mp, moPct: _mo, logPct: _log, opexPct: _opx,
      dio: _dio, dso: _dso, dpo: _dpo, activosFijos: _af, tasaImpuesto
    });
  }, [
    fb, negProveedores, optProduccion, optLogistica, jit, mejoraCobro,
    mejoraPago, mantenimiento, mixMargen, ventas, mpPct, moPct, logPct,
    opexPct, dio, dso, dpo, activosFijos, tasaImpuesto
  ]);

  const delta = (a: number, b: number) => {
    const d = b - a; const sign = d > 0 ? "+" : "";
    return `${sign}${d.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };
  const deltaPct = (a: number, b: number) => {
    const d = (b - a) * 100; const sign = d > 0 ? "+" : "";
    return `${sign}${d.toFixed(1)}pp`;
  };

  /* ----- Exportar CSV (usa los valores actuales en memoria) ----- */
  const exportCSV = () => {
    const escapeCSV = (v: any) => `"${String(v).replaceAll('"', '""')}"`;
    const rows: any[] = [];

    rows.push(["Fecha", new Date().toISOString()]);
    rows.push(["Ventas", base.ventas]);
    rows.push(["Impuesto efectivo", tasaImpuesto]);
    rows.push(["DIO", dio], ["DSO", dso], ["DPO", dpo]);
    rows.push(["%MP", mpPct], ["%MO", moPct], ["%Logística", logPct], ["%Opex", opexPct]);
    rows.push(["Activos fijos", activosFijos]);
    rows.push(["Palancas", ""], ["Feedback", fb], ["Neg. Proveedores", negProveedores],
      ["Opt. Producción", optProduccion], ["Logística eficiente", optLogistica],
      ["Just-in-Time", jit], ["Mejora cobros", mejoraCobro], ["Mejora pagos", mejoraPago],
      ["Mantto. predictivo", mantenimiento], ["Mix mayor margen", mixMargen]);
    rows.push([]);

    rows.push(["Métrica", "Base", "Con feedback", "Δ"]);
    rows.push(["Margen bruto", `${(base.margenBruto * 100).toFixed(1)}%`, `${(tuned.margenBruto * 100).toFixed(1)}%`, `${((tuned.margenBruto - base.margenBruto) * 100).toFixed(1)}pp`]);
    rows.push(["Margen operativo", `${(base.margenOperativo * 100).toFixed(1)}%`, `${(tuned.margenOperativo * 100).toFixed(1)}%`, `${((tuned.margenOperativo - base.margenOperativo) * 100).toFixed(1)}pp`]);
    rows.push(["EBIT", base.ebit, tuned.ebit, tuned.ebit - base.ebit]);
    rows.push(["CCC (días)", base.ccc, tuned.ccc, tuned.ccc - base.ccc]);
    rows.push(["Capital de trabajo", base.capitalTrabajo, tuned.capitalTrabajo, tuned.capitalTrabajo - base.capitalTrabajo]);
    rows.push(["Inventario", base.inventario, tuned.inventario, tuned.inventario - base.inventario]);
    rows.push(["Beneficio neto", base.beneficioNeto, tuned.beneficioNeto, tuned.beneficioNeto - base.beneficioNeto]);
    rows.push(["Inversión total", base.inversionTotal, tuned.inversionTotal, tuned.inversionTotal - base.inversionTotal]);
    rows.push(["ROI", `${(base.roi * 100).toFixed(2)}%`, `${(tuned.roi * 100).toFixed(2)}%`, `${((tuned.roi - base.roi) * 100).toFixed(2)}pp`]);

    const csv = rows.map(r => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpis_feedback_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Flujo lineal con retroalimentación — Simulador</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg border shadow-sm text-sm hover:bg-slate-50"
            >
              Exportar CSV
            </button>
            <span className="text-sm text-slate-600">Feedback</span>
            <button
              onClick={() => setFb(!fb)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                fb ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  fb ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Intro + diagrama */}
        <section className="grid md:grid-cols-2 gap-6 items-center">
          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-2">Del lineal rígido al sistema inteligente</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Finanzas deja de ser el final del flujo y devuelve inteligencia hacia
              Suministro, Operaciones y Logística para ajustar decisiones en ciclo continuo.
            </p>
            <ul className="mt-3 text-sm list-disc pl-5 space-y-1">
              <li>Márgenes: reducción de costos y mejora de eficiencia.</li>
              <li>Liquidez: capital de trabajo optimizado (inventario, cobros, pagos).</li>
              <li>ROI: más beneficio con menos inversión inmovilizada.</li>
            </ul>
          </div>
          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <FlowDiagram feedback={fb} />
          </div>
        </section>

        {/* Parámetros y palancas */}
        <section className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <h3 className="font-semibold mb-1">Entradas del negocio</h3>
            <p className="text-xs text-slate-500 mb-4">Ajusta los parámetros base para tu caso.</p>
            <NumberSlider label="Ventas anuales" value={ventas} setValue={setVentas} min={500000} max={20000000} step={50000} suffix=" €" />
            <NumberSlider label="% Materia prima" value={mpPct} setValue={setMpPct} min={0} max={60} step={1} suffix=" %" />
            <NumberSlider label="% Mano de obra" value={moPct} setValue={setMoPct} min={0} max={40} step={1} suffix=" %" />
            <NumberSlider label="% Logística" value={logPct} setValue={setLogPct} min={0} max={25} step={1} suffix=" %" />
            <NumberSlider label="% Opex (gastos operativos)" value={opexPct} setValue={setOpexPct} min={0} max={40} step={1} suffix=" %" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <label className="text-xs text-slate-500">DIO (días inventario)</label>
                <input className="w-full mt-1 p-2 border rounded" type="number" value={dio} onChange={(e) => setDio(parseInt(e.target.value || "0"))} />
              </div>
              <div>
                <label className="text-xs text-slate-500">DSO (días cobro)</label>
                <input className="w-full mt-1 p-2 border rounded" type="number" value={dso} onChange={(e) => setDso(parseInt(e.target.value || "0"))} />
              </div>
              <div>
                <label className="text-xs text-slate-500">DPO (días pago)</label>
                <input className="w-full mt-1 p-2 border rounded" type="number" value={dpo} onChange={(e) => setDpo(parseInt(e.target.value || "0"))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs text-slate-500">Activos fijos</label>
                <input className="w-full mt-1 p-2 border rounded" type="number" value={activosFijos} onChange={(e) => setActivosFijos(parseInt(e.target.value || "0"))} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Impuesto efectivo</label>
                <select className="w-full mt-1 p-2 border rounded" value={tasaImpuesto} onChange={(e) => setTasaImpuesto(parseFloat(e.target.value))}>
                  {[0.0, 0.19, 0.25, 0.30].map((t) => (
                    <option key={t} value={t}>{pct(t * 100)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <h3 className="font-semibold mb-1">Palancas de retroalimentación</h3>
            <p className="text-xs text-slate-500 mb-4">Activa mejoras que Finanzas devuelve al resto del flujo.</p>
            <div className="grid grid-cols-1 gap-2">
              <Toggle label="Negociación con proveedores (−5% MP)" checked={negProveedores} onChange={setNegProveedores} hint="Suministro" />
              <Toggle label="Optimización de producción (−5% MO, −3% Opex)" checked={optProduccion} onChange={setOptProduccion} hint="Operaciones" />
              <Toggle label="Logística eficiente (−10% costos logísticos)" checked={optLogistica} onChange={setOptLogistica} hint="Logística" />
              <Toggle label="Just-in-Time (−30% DIO)" checked={jit} onChange={setJit} hint="Inventario" />
              <Toggle label="Mejora de cobros (−20% DSO)" checked={mejoraCobro} onChange={setMejoraCobro} hint="Clientes" />
              <Toggle label="Mejora de pagos (+15% DPO)" checked={mejoraPago} onChange={setMejoraPago} hint="Proveedores" />
              <Toggle label="Mantenimiento predictivo (−10% activos fijos)" checked={mantenimiento} onChange={setMantenimiento} hint="Capex" />
              <Toggle label="Mix de mayor margen (−2pp COGS)" checked={mixMargen} onChange={setMixMargen} hint="Priorizar productos rentables" />
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5" /><h3 className="font-semibold">Márgenes</h3></div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 text-slate-500">Margen bruto</td><td className="py-1 text-right font-mono">{pct(base.margenBruto * 100)}</td><td className="py-1 text-right font-mono">→ {pct(tuned.margenBruto * 100)} <span className="text-emerald-700">({deltaPct(base.margenBruto, tuned.margenBruto)})</span></td></tr>
                <tr><td className="py-1 text-slate-500">Margen operativo</td><td className="py-1 text-right font-mono">{pct(base.margenOperativo * 100)}</td><td className="py-1 text-right font-mono">→ {pct(tuned.margenOperativo * 100)} <span className="text-emerald-700">({deltaPct(base.margenOperativo, tuned.margenOperativo)})</span></td></tr>
                <tr><td className="py-1 text-slate-500">EBIT</td><td className="py-1 text-right font-mono">{money(base.ebit)}</td><td className="py-1 text-right font-mono">→ {money(tuned.ebit)} <span className="text-emerald-700">({money(tuned.ebit - base.ebit)})</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2"><Droplets className="w-5 h-5" /><h3 className="font-semibold">Liquidez</h3></div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 text-slate-500">CCC (días)</td><td className="py-1 text-right font-mono">{fmt(base.ccc)}</td><td className="py-1 text-right font-mono">→ {fmt(tuned.ccc)} <span className="text-emerald-700">({delta(base.ccc, tuned.ccc)})</span></td></tr>
                <tr><td className="py-1 text-slate-500">Capital de trabajo</td><td className="py-1 text-right font-mono">{money(base.capitalTrabajo)}</td><td className="py-1 text-right font-mono">→ {money(tuned.capitalTrabajo)} <span className="text-emerald-700">({money(tuned.capitalTrabajo - base.capitalTrabajo)})</span></td></tr>
                <tr><td className="py-1 text-slate-500">Inventario</td><td className="py-1 text-right font-mono">{money(base.inventario)}</td><td className="py-1 text-right font-mono">→ {money(tuned.inventario)} <span className="text-emerald-700">({money(tuned.inventario - base.inventario)})</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-white rounded-2xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2"><Rocket className="w-5 h-5" /><h3 className="font-semibold">ROI</h3></div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 text-slate-500">Beneficio neto</td><td className="py-1 text-right font-mono">{money(base.beneficioNeto)}</td><td className="py-1 text-right font-mono">→ {money(tuned.beneficioNeto)} <span className="text-emerald-700">({money(tuned.beneficioNeto - base.beneficioNeto)})</span></td></tr>
                <tr><td className="py-1 text-slate-500">Inversión total</td><td className="py-1 text-right font-mono">{money(base.inversionTotal)}</td><td className="py-1 text-right font-mono">→ {money(tuned.inversionTotal)} <span className="text-emerald-700">({money(tuned.inversionTotal - base.inversionTotal)})</span></td></tr>
                <tr><td className="py-1 text-slate-500">ROI</td><td className="py-1 text-right font-mono">{pct(base.roi * 100)}</td><td className="py-1 text-right font-mono">→ {pct(tuned.roi * 100)} <span className="text-emerald-700">({deltaPct(base.roi, tuned.roi)})</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Resumen narrativo */}
        <section className="mt-6 p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCcw className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-emerald-800">Resumen del impacto</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold">Márgenes</div>
              <p>
                La retroalimentación ataca COGS y Opex en cada eslabón. Resultado:
                {" "}{pct((tuned.margenOperativo - base.margenOperativo) * 100)} en margen operativo
                y {" "}{money(tuned.ebit - base.ebit)} de EBIT adicional.
              </p>
            </div>
            <div>
              <div className="font-semibold">Liquidez</div>
              <p>
                Optimizar DIO/DSO/DPO acorta el ciclo de caja a {fmt(tuned.ccc)} días
                y libera {money(base.capitalTrabajo - tuned.capitalTrabajo)} de capital de trabajo.
              </p>
            </div>
            <div>
              <div className="font-semibold">ROI</div>
              <p>
                Más beneficio con menos inversión inmovilizada:
                ROI pasa de {pct(base.roi * 100)} a {pct(tuned.roi * 100)}.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla resumen */}
        <section className="mt-6 p-5 bg-white rounded-2xl shadow-sm border overflow-auto">
          <h3 className="font-semibold mb-2">Tabla resumen</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Métrica</th>
                <th className="py-2">Base</th>
                <th className="py-2">Con feedback</th>
                <th className="py-2">Δ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="py-1">Margen bruto</td><td className="py-1">{pct(base.margenBruto * 100)}</td><td className="py-1">{pct(tuned.margenBruto * 100)}</td><td className="py-1">{deltaPct(base.margenBruto, tuned.margenBruto)}</td></tr>
              <tr><td className="py-1">Margen operativo</td><td className="py-1">{pct(base.margenOperativo * 100)}</td><td className="py-1">{pct(tuned.margenOperativo * 100)}</td><td className="py-1">{deltaPct(base.margenOperativo, tuned.margenOperativo)}</td></tr>
              <tr><td className="py-1">EBIT</td><td className="py-1">{money(base.ebit)}</td><td className="py-1">{money(tuned.ebit)}</td><td className="py-1">{money(tuned.ebit - base.ebit)}</td></tr>
              <tr><td className="py-1">CCC (días)</td><td className="py-1">{fmt(base.ccc)}</td><td className="py-1">{fmt(tuned.ccc)}</td><td className="py-1">{delta(base.ccc, tuned.ccc)}</td></tr>
              <tr><td className="py-1">Capital de trabajo</td><td className="py-1">{money(base.capitalTrabajo)}</td><td className="py-1">{money(tuned.capitalTrabajo)}</td><td className="py-1">{money(tuned.capitalTrabajo - base.capitalTrabajo)}</td></tr>
              <tr><td className="py-1">Beneficio neto</td><td className="py-1">{money(base.beneficioNeto)}</td><td className="py-1">{money(tuned.beneficioNeto)}</td><td className="py-1">{money(tuned.beneficioNeto - base.beneficioNeto)}</td></tr>
              <tr><td className="py-1">Inversión total</td><td className="py-1">{money(base.inversionTotal)}</td><td className="py-1">{money(tuned.inversionTotal)}</td><td className="py-1">{money(tuned.inversionTotal - base.inversionTotal)}</td></tr>
              <tr><td className="py-1">ROI</td><td className="py-1">{pct(base.roi * 100)}</td><td className="py-1">{pct(tuned.roi * 100)}</td><td className="py-1">{deltaPct(base.roi, tuned.roi)}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="mt-6 text-xs text-slate-500">
          <p>
            Notas: simulador educativo con aproximaciones estándar (CCC, capital de trabajo, márgenes y ROI).
            Ajusta supuestos a tu sector.
          </p>
        </section>
      </main>
    </div>
  );
}

