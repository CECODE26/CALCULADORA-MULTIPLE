"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Icon } from "@/components/ui/Icon";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { StackedBarChart } from "@/components/charts/Chart";
import { DataTable } from "@/components/DataTable";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { summarizeByYear, type AmortizationSystem } from "@/lib/calc/amortization";
import { compareLenders, findLender, nominalToEffective, simulateLenderLoan } from "@/lib/calc/lender";
import { downloadCsv, toCsv } from "@/lib/csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { round2 } from "@/lib/number";
import { BCE_MAX_RATES, CATEGORY_LABELS, LENDER_KIND_LABELS, lenders as publishedLenders, type Lender } from "@/data/tasas-ecuador";

const SLUG = "simulador-credito-ecuador";
const INITIAL = { principal: "", term: "" };
const ROW_PREVIEW = 120;

export function LenderSimulator({ lenders = publishedLenders }: { lenders?: readonly Lender[] }) {
  if (lenders.length === 0) {
    return (
      <ErrorMessage tone="info">Estamos verificando las tasas oficiales de cada entidad. El simulador estará disponible en breve.</ErrorMessage>
    );
  }
  return <Simulator lenders={lenders} />;
}

function Simulator({ lenders }: { lenders: readonly Lender[] }) {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [lenderId, setLenderId] = useState(lenders[0]!.id);
  const lender = findLender(lenderId, lenders) ?? lenders[0]!;
  const [productId, setProductId] = useState(lender.products[0]!.id);
  const product = lender.products.find((p) => p.id === productId) ?? lender.products[0]!;
  const [system, setSystem] = useState<AmortizationSystem>("french");
  const [showAll, setShowAll] = useState(false);
  const { locale, pct } = usePrefs();
  // Los créditos en Ecuador son en dólares: se muestra siempre USD, sea cual sea la moneda elegida en el sitio.
  const usd = (v: unknown) => formatCurrency(v, { locale, currency: "USD" });

  function changeLender(id: string) {
    const next = findLender(id, lenders);
    if (!next) return;
    setLenderId(id);
    // Se conserva el mismo tipo de crédito si la nueva entidad lo ofrece
    const same = next.products.find((p) => p.category === product.category);
    setProductId((same ?? next.products[0]!).id);
    setShowAll(false);
  }

  const res = useMemo(
    () => simulateLenderLoan({ product, principal: nums.principal, months: nums.term, system }),
    [product, nums, system],
  );
  useTrackCalculation(SLUG, product.category, res.ok, signature + lenderId + productId + system);

  const years = useMemo(() => (res.ok ? summarizeByYear(res.value.rows, 12) : []), [res]);
  const comparison = useMemo(
    () => (res.ok ? compareLenders(product.category, nums.principal, nums.term, system, lenders) : []),
    [res.ok, product.category, nums, system, lenders],
  );
  const cap = BCE_MAX_RATES.rates[product.segment];
  const effective = product.effectiveRate ?? nominalToEffective(product.nominalRate);

  function resetAll() {
    reset();
    setSystem("french");
    setShowAll(false);
  }

  function exportCsv() {
    if (!res.ok) return;
    const csv = toCsv(
      ["Cuota", "Pago", "Capital", "Interés", "Saldo"],
      res.value.rows.map((r) => [r.period, r.payment.toFixed(2), r.principal.toFixed(2), r.interest.toFixed(2), r.balance.toFixed(2)]),
    );
    downloadCsv(`simulacion-${lender.id}-${product.id}.csv`, csv);
  }

  const general = generalError(res, ["principal", "term"]);
  const rows = res.ok ? (showAll ? res.value.rows : res.value.rows.slice(0, ROW_PREVIEW)) : [];
  const limits = [
    `Plazo: ${product.minMonths} a ${product.maxMonths} meses`,
    product.minAmount !== undefined || product.maxAmount !== undefined
      ? `Monto: ${product.minAmount !== undefined ? usd(product.minAmount) : "sin mínimo publicado"} a ${
          product.maxAmount !== undefined ? usd(product.maxAmount) : "sin máximo publicado"
        }`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="lender-data">
        <h2 id="lender-data" className="panel__title">
          Entidad y crédito
        </h2>
        <div className="fields">
          <div className="field">
            <label className="field__label" htmlFor="lender-select">
              Entidad financiera
            </label>
            <div className="field__control">
              <select id="lender-select" className="field__select" value={lenderId} onChange={(e) => changeLender(e.target.value)}>
                {(["banco", "cooperativa", "publica"] as const).map((kind) => {
                  const group = lenders.filter((l) => l.kind === kind);
                  return group.length > 0 ? (
                    <optgroup key={kind} label={LENDER_KIND_LABELS[kind]}>
                      {group.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </div>
          </div>
          <Select
            label="Tipo de crédito"
            value={product.id}
            options={lender.products.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(id) => {
              setProductId(id);
              setShowAll(false);
            }}
            hint={limits}
          />
          <div className="rate-facts" aria-live="polite">
            <p>
              <span className="muted">Tasa nominal anual: </span>
              <strong>{pct(product.nominalRate, 2)}</strong>
              <span className="muted"> · efectiva: </span>
              <strong>{pct(effective, 2)}</strong>
            </p>
            {cap ? (
              <p className="muted">
                Máxima del BCE para {cap.label.toLowerCase()}: {pct(cap.maxEffective, 2)} efectiva.
              </p>
            ) : null}
            <p className="muted">
              Fuente:{" "}
              <a href={product.source} target="_blank" rel="noopener noreferrer">
                {lender.name}
              </a>{" "}
              · vigente a {formatDate(product.asOf, locale)}
            </p>
          </div>
          <NumberInput label="Monto del crédito" prefix="$" placeholder="0" value={values.principal} onChange={set("principal")} error={fieldError(res, "principal")} />
          <NumberInput
            label="Plazo"
            suffix="meses"
            inputMode="numeric"
            value={values.term}
            onChange={set("term")}
            error={fieldError(res, "term")}
          />
        </div>
        <SegmentedControl
          label="Sistema de amortización"
          value={system}
          onChange={setSystem}
          options={[
            { value: "french", label: "Cuota fija (francés)" },
            { value: "german", label: "Capital fijo (alemán)" },
          ]}
        />
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            <ResultCard
              label={system === "french" ? "Cuota mensual" : "Primera cuota mensual"}
              value={usd(res.value.firstPayment)}
              note={
                system === "french"
                  ? `${res.value.periods} cuotas iguales con ${lender.name} (${product.name.toLowerCase()}).`
                  : `Las cuotas bajan hasta ${usd(res.value.lastPayment)} en el último mes (${res.value.periods} cuotas).`
              }
              animationKey={lenderId + productId + system}
            >
              <ResultBreakdown
                rows={[
                  { label: "Monto", value: usd(res.value.principal) },
                  { label: "Intereses totales", value: usd(res.value.totalInterest) },
                  { label: "Total a pagar", value: usd(res.value.totalPaid), total: true },
                  { label: "Tasa nominal anual", value: pct(product.nominalRate, 2) },
                  { label: "Tasa efectiva anual", value: pct(res.value.effectiveAnnualRate * 100, 2) },
                ]}
              />
              <p className="result-card__note">
                No incluye seguro de desgravamen, contribución SOLCA ni otros cargos que la entidad pueda sumar a la cuota.
              </p>
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() =>
                [
                  `${lender.name} · ${product.name}: ${usd(res.value.principal)} a ${res.value.periods} meses (${system === "french" ? "cuota fija" : "capital fijo"}).`,
                  `${system === "french" ? "Cuota" : "Primera cuota"}: ${usd(res.value.firstPayment)}`,
                  `Intereses totales: ${usd(res.value.totalInterest)}`,
                  `Total a pagar: ${usd(res.value.totalPaid)}`,
                  `Tasa referencial ${pct(product.nominalRate, 2)} nominal (${formatDate(product.asOf, locale)}).`,
                ].join("\n")
              }
            />
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Elige la entidad y el crédito, e introduce el monto y el plazo en meses.</ResultEmpty>
        )}
      </div>

      {res.ok ? (
        <section className="calc__full" aria-labelledby="lender-compare">
          <div className="table-toolbar">
            <h2 id="lender-compare" style={{ fontSize: "1.15rem" }}>
              El mismo crédito en otras entidades
            </h2>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            {CATEGORY_LABELS[product.category]} de {usd(res.value.principal)} a {res.value.periods} meses, ordenado por
            total a pagar. Solo aparecen las entidades cuyo plazo y monto publicados admiten esta simulación.
          </p>
          <DataTable
            caption={`Comparación de ${CATEGORY_LABELS[product.category].toLowerCase()} entre entidades`}
            hideCaption
            rowKey={(r) => `${r.lender.id}-${r.product.id}`}
            rows={comparison}
            columns={[
              {
                key: "e",
                header: "Entidad",
                cell: (r) => (r.lender.id === lender.id && r.product.id === product.id ? <strong>{r.lender.name} (elegida)</strong> : r.lender.name),
              },
              { key: "t", header: "Tasa nominal", cell: (r) => pct(r.product.nominalRate, 2) },
              { key: "c", header: system === "french" ? "Cuota" : "Primera cuota", cell: (r) => usd(r.firstPayment) },
              { key: "i", header: "Intereses", cell: (r) => usd(r.totalInterest) },
              { key: "p", header: "Total", cell: (r) => usd(r.totalPaid) },
            ]}
          />

          {years.length > 1 ? (
            <StackedBarChart
              title="Capital e intereses pagados por año"
              description={`Gráfico de ${years.length} años de la simulación con ${lender.name}.`}
              labels={years.map((y) => `Año ${y.year}`)}
              series={[
                { name: "Capital", color: "var(--chart-1)", values: years.map((y) => y.principal) },
                { name: "Intereses", color: "var(--chart-2)", values: years.map((y) => y.interest) },
              ]}
            />
          ) : null}
          <div className="table-toolbar">
            <h2 id="lender-table" style={{ fontSize: "1.15rem" }}>
              Tabla de amortización
            </h2>
            <button type="button" className="btn btn--sm" onClick={exportCsv}>
              <Icon name="table" size={16} /> Descargar CSV
            </button>
          </div>
          <DataTable
            caption={`Tabla de amortización de ${res.value.periods} cuotas con ${lender.name}`}
            hideCaption
            scroll
            rowKey={(r) => r.period}
            rows={rows}
            columns={[
              { key: "n", header: "Cuota", cell: (r) => r.period, footer: "Total" },
              { key: "p", header: "Pago", cell: (r) => usd(r.payment), footer: usd(res.value.totalPaid) },
              { key: "c", header: "Capital", cell: (r) => usd(r.principal), footer: usd(round2(res.value.principal)) },
              { key: "i", header: "Interés", cell: (r) => usd(r.interest), footer: usd(res.value.totalInterest) },
              { key: "s", header: "Saldo", cell: (r) => usd(r.balance) },
            ]}
          />
          {res.value.rows.length > ROW_PREVIEW && !showAll ? (
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn--sm" onClick={() => setShowAll(true)}>
                Mostrar las {res.value.rows.length} cuotas
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
