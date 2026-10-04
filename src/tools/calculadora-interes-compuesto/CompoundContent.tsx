import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function CompoundContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>
        Proyecta cuánto valdría tu dinero si los intereses se reinvierten (interés compuesto), con o sin aportaciones
        periódicas. En el modo <strong>«¿Cuánto aportar para una meta?»</strong> calcula la aportación necesaria en
        cada periodo para llegar a un objetivo.
      </p>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Indica el capital inicial y, si quieres, una aportación periódica.</li>
        <li>Escribe la tasa anual estimada y el plazo.</li>
        <li>
          Elige cada cuánto se capitalizan los intereses y cada cuánto aportas. Marca «al inicio de cada periodo» si
          aportas al principio (por ejemplo, el día que cobras).
        </li>
      </ol>

      <h2>Fórmulas</h2>
      <h3>Sin aportaciones</h3>
      <Formula>{"A = P × (1 + r/n)^(n·t)"}</Formula>
      <h3>Con aportaciones periódicas</h3>
      <Formula>
        {"i = (1 + r/n)^(n/m) − 1\nFV = P × (1 + r/n)^(n·t) + C × ((1 + i)^(m·t) − 1) / i\n(aportando al inicio: el segundo término se multiplica por (1 + i))"}
      </Formula>
      <Variables
        items={[
          ["P", "Capital inicial."],
          ["C", "Aportación periódica."],
          ["r", "Tasa de interés anual nominal en decimal (7 % → 0,07)."],
          ["n", "Capitalizaciones por año (12 = mensual)."],
          ["m", "Aportaciones por año."],
          ["t", "Plazo en años."],
          ["i", "Tasa equivalente por periodo de aportación."],
        ]}
      />
      <p>
        Para calcular la aportación necesaria se despeja C: <code>C = (Meta − P(1 + r/n)^(n·t)) × i / ((1 + i)^(m·t) − 1)</code>.
        La herramienta redondea C hacia arriba al céntimo para asegurar que se alcanza la meta.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Inviertes <strong>5.000</strong> y aportas <strong>200 al mes</strong> durante <strong>10 años</strong> a
          un <strong>7 % anual</strong> capitalizable mensualmente. Aportas 29.000 en total y el saldo estimado es
          de unos <strong>44.700</strong>: unos 15.665 corresponden a intereses.
        </p>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar el resultado</h2>
      <ul>
        <li>
          <strong>Total aportado</strong> es el dinero que sale de tu bolsillo; <strong>rendimiento</strong> es lo que
          generan los intereses.
        </li>
        <li>
          El gráfico muestra cómo la diferencia entre saldo y aportaciones crece con el tiempo: ese es el efecto del
          interés compuesto.
        </li>
        <li>
          Los rendimientos reales varían: inflación, comisiones e impuestos reducen el resultado. Úsalo como
          escenario, no como promesa.
        </li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Confundir tasa nominal y efectiva.</strong> Un 7 % nominal capitalizable mensualmente equivale a un
          7,23 % efectivo anual.
        </li>
        <li>
          <strong>Suponer rentabilidades altas constantes.</strong> Prueba varios escenarios (pesimista, base,
          optimista).
        </li>
        <li>
          <strong>Olvidar la inflación.</strong> Para estimar poder adquisitivo, resta aproximadamente la inflación
          esperada a la tasa.
        </li>
      </ul>
      <p>
        Si prefieres un enfoque más sencillo basado en ahorro mensual, usa la{" "}
        <Link href="/calculadora-ahorro">calculadora de ahorro</Link>. Si lo que tienes es una deuda, la{" "}
        <Link href="/calculadora-prestamos">calculadora de préstamos</Link> te muestra cuánto cuesta.
      </p>
    </>
  );
}
