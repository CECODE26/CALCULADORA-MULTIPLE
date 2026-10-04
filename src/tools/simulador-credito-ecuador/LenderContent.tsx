import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula } from "@/components/content/Content";
import { formatDate } from "@/lib/format";
import { BCE_MAX_RATES } from "@/data/tasas-ecuador";

/** Aviso específico: las tasas son referenciales y tienen fecha y fuente. */
export function RatesDisclaimer() {
  return (
    <p>
      <strong>Tasas referenciales:</strong> cada tasa se tomó de la página oficial de la entidad en la fecha indicada
      junto a ella y puede haber cambiado. La tasa final depende de tu perfil, el monto, el plazo y las garantías.
      {BCE_MAX_RATES.asOf ? (
        <>
          {" "}
          Tasas máximas del <a href={BCE_MAX_RATES.source}>Banco Central del Ecuador</a> vigentes desde{" "}
          {formatDate(BCE_MAX_RATES.asOf)}.
        </>
      ) : null}
    </p>
  );
}

export function LenderContent() {
  return (
    <>
      <h2>Cómo usar el simulador</h2>
      <ol>
        <li>Elige el banco o la cooperativa y el tipo de crédito. Verás su tasa nominal, la efectiva y los plazos admitidos.</li>
        <li>Escribe el monto en dólares y el plazo en meses.</li>
        <li>Elige cuota fija (sistema francés) o capital fijo (sistema alemán).</li>
        <li>Revisa la cuota, la tabla de amortización y cuánto costaría el mismo crédito en otras entidades.</li>
      </ol>

      <h2>Tasa nominal y tasa efectiva</h2>
      <p>
        Las entidades en Ecuador publican dos tasas. La <strong>nominal anual</strong> es la que se divide para 12 para
        calcular el interés de cada mes. La <strong>efectiva anual</strong> incluye la capitalización mensual y es la que
        sirve para comparar créditos. El Banco Central del Ecuador fija una tasa efectiva máxima para cada segmento de
        crédito (consumo, vivienda, microcrédito, productivo, educativo) y ninguna entidad puede cobrar más.
      </p>
      <Formula>{"Tasa mensual = Tasa nominal anual / 12\nTasa efectiva anual = (1 + Tasa mensual)^12 − 1"}</Formula>

      <AdSlot placement="toolInContent" />

      <h2>Cuota fija o capital fijo</h2>
      <p>
        Con el <strong>sistema francés</strong> pagas la misma cuota todos los meses. Con el <strong>sistema alemán</strong>{" "}
        pagas el mismo capital cada mes más los intereses del saldo, así que la cuota empieza más alta, va bajando y en
        total pagas menos intereses. Pregunta a tu entidad con qué sistema te ofrece el crédito. Si quieres probar otra tasa, plazos
        trimestrales o semestrales, usa la <Link href="/tabla-amortizacion">tabla de amortización</Link>.
      </p>

      <h2>Qué no incluye la simulación</h2>
      <p>
        La cuota real suele ser un poco mayor porque la entidad suma el <strong>seguro de desgravamen</strong> y, en
        algunos créditos, seguros de incendio o del vehículo. En créditos a más de un año también puede aplicarse la{" "}
        <strong>contribución a SOLCA</strong>. Pide siempre la tabla de amortización oficial antes de firmar.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Un crédito de <strong>10.000 USD</strong> a <strong>36 meses</strong> con una tasa nominal del{" "}
          <strong>15 %</strong> tiene una tasa mensual de 1,25 % y una cuota fija de aproximadamente{" "}
          <strong>346,65 USD</strong>. En total se pagan unos 2.479 USD de intereses.
        </p>
      </Example>
    </>
  );
}
