import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function LoanContent() {
  return (
    <>
      <h2>¿Qué calcula esta calculadora de préstamos?</h2>
      <p>
        Calcula la <strong>cuota fija</strong> que pagarías cada mes por un préstamo con el sistema de amortización
        francés, el más habitual en créditos de consumo, automotrices e hipotecarios. También muestra cuánto pagarás
        en intereses y el costo total del crédito.
      </p>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Escribe el monto que te prestan (el capital).</li>
        <li>
          Introduce la tasa de interés y elige su tipo: <strong>anual nominal</strong> (la más común en ofertas
          bancarias), <strong>anual efectiva</strong> (TEA o EA) o <strong>mensual</strong>.
        </li>
        <li>Indica el plazo en meses o en años.</li>
      </ol>
      <p>El resultado se actualiza al instante. Puedes ver el detalle de cada pago en la tabla de amortización.</p>

      <h2>Fórmula de la cuota</h2>
      <Formula>{"Cuota = P × r / (1 − (1 + r)^(−n))"}</Formula>
      <Variables
        items={[
          ["P", "Capital prestado."],
          ["r", "Tasa de interés mensual en decimal (12 % anual nominal → 0,12 / 12 = 0,01)."],
          ["n", "Número total de cuotas mensuales."],
        ]}
      />
      <p>
        Si la tasa es efectiva anual, la tasa mensual equivalente es <code>(1 + TEA)^(1/12) − 1</code>. Si la tasa es 0
        %, la cuota es simplemente <code>P / n</code>.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Préstamo de <strong>10.000</strong> al <strong>12 % anual nominal</strong> durante <strong>12 meses</strong>:
        </p>
        <ul>
          <li>r = 0,12 / 12 = 0,01</li>
          <li>Cuota = 10.000 × 0,01 / (1 − 1,01^−12) ≈ <strong>888,49</strong></li>
          <li>Total pagado ≈ 10.661,85, de los cuales 661,85 son intereses.</li>
        </ul>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar el resultado</h2>
      <ul>
        <li>
          <strong>Cuota mensual:</strong> lo que pagarías cada mes por capital e intereses. No incluye seguros,
          comisiones ni impuestos que la entidad pueda añadir.
        </li>
        <li>
          <strong>Intereses totales:</strong> el costo del dinero prestado. Un plazo más largo reduce la cuota, pero
          aumenta los intereses.
        </li>
        <li>
          <strong>Tasa efectiva anual equivalente:</strong> permite comparar ofertas con distinta forma de expresar la
          tasa.
        </li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Confundir tasa anual y mensual.</strong> Un 2 % mensual equivale a más de un 26 % efectivo anual.
        </li>
        <li>
          <strong>Comparar solo la cuota.</strong> Dos préstamos con cuota parecida pueden tener costos totales muy
          diferentes según el plazo.
        </li>
        <li>
          <strong>Olvidar los costos adicionales.</strong> Seguros de desgravamen, comisiones de apertura o impuestos
          elevan el costo real; pide a tu entidad la tasa de costo efectivo total.
        </li>
      </ul>
      <p>
        Para ver cómo baja el saldo pago a pago, usa la <Link href="/tabla-amortizacion">tabla de amortización</Link>.
        Si en lugar de pedir prestado estás ahorrando, prueba la{" "}
        <Link href="/calculadora-interes-compuesto">calculadora de interés compuesto</Link>.
      </p>
    </>
  );
}
