import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function AmortizationContent() {
  return (
    <>
      <h2>¿Qué es una tabla de amortización?</h2>
      <p>
        Es el calendario de pagos de un préstamo. Para cada cuota indica cuánto pagas en total, qué parte reduce la
        deuda (<strong>capital</strong>), qué parte son <strong>intereses</strong> y cuál es el{" "}
        <strong>saldo pendiente</strong> después del pago.
      </p>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Elige el sistema: cuota fija (francés) o capital fijo (alemán).</li>
        <li>Introduce el capital, la tasa con su tipo y el plazo.</li>
        <li>
          Selecciona la frecuencia de pago. El plazo debe equivaler a un número entero de pagos (por ejemplo, 18 meses
          con pagos trimestrales son 6 pagos).
        </li>
        <li>Revisa la tabla o descárgala en CSV para abrirla en una hoja de cálculo.</li>
      </ol>

      <h2>Sistema francés y sistema alemán</h2>
      <h3>Sistema francés (cuota fija)</h3>
      <Formula>{"Cuota = P × i / (1 − (1 + i)^(−n))\nInterés_k = Saldo_(k−1) × i\nCapital_k = Cuota − Interés_k"}</Formula>
      <p>
        Todas las cuotas son iguales. Al principio la mayor parte de cada pago son intereses; con el tiempo aumenta la
        parte que amortiza capital.
      </p>
      <h3>Sistema alemán (capital constante)</h3>
      <Formula>{"Capital_k = P / n\nInterés_k = Saldo_(k−1) × i\nCuota_k = Capital_k + Interés_k"}</Formula>
      <p>
        Se amortiza la misma cantidad de capital en cada pago, por lo que la cuota empieza más alta y va bajando. En
        total se pagan menos intereses que con el sistema francés.
      </p>
      <Variables
        items={[
          ["P", "Capital prestado."],
          ["i", "Tasa por periodo de pago (por ejemplo, 10 % anual nominal con pagos mensuales → 0,10 / 12)."],
          ["n", "Número total de pagos."],
          ["k", "Número de la cuota (1, 2, … n)."],
        ]}
      />

      <h2>Redondeo y saldo final</h2>
      <p>
        Cada importe se redondea a céntimos, como hacen las entidades. Para que el saldo termine exactamente en cero, la{" "}
        <strong>última cuota se ajusta</strong> con la diferencia acumulada por el redondeo, que normalmente es de
        unos pocos céntimos.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Préstamo de <strong>20.000</strong> al <strong>10 % anual nominal</strong>, 2 años, pagos mensuales, sistema
          francés: la tasa mensual es 0,8333 % y la cuota es de aproximadamente <strong>922,90</strong>. En el primer
          mes se pagan 166,67 de intereses y 756,23 de capital; en el último, apenas 7,63 de intereses.
        </p>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar la tabla</h2>
      <ul>
        <li>La columna de saldo muestra cuánto deberías si quisieras cancelar el préstamo tras ese pago (sin comisiones).</li>
        <li>Hacer abonos extraordinarios al inicio reduce más intereses, porque es cuando el saldo es mayor.</li>
        <li>El gráfico anual muestra cómo cambia la proporción entre capital e intereses a lo largo del préstamo.</li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Usar una tasa anual como si fuera del periodo.</strong> Elige correctamente el tipo de tasa; la
          herramienta la convierte a la frecuencia de pago.
        </li>
        <li>
          <strong>Esperar que coincida al céntimo con el banco.</strong> Las entidades pueden usar años de 360 días,
          fechas exactas de pago o incluir seguros en la cuota.
        </li>
        <li>
          <strong>Comparar sistemas solo por la primera cuota.</strong> El sistema alemán exige más al principio pero
          reduce el costo total.
        </li>
      </ul>
      <p>
        ¿Solo necesitas la cuota? Usa la <Link href="/calculadora-prestamos">calculadora de préstamos</Link>. Para
        proyectar una inversión, prueba la <Link href="/calculadora-interes-compuesto">calculadora de interés compuesto</Link>.
      </p>
    </>
  );
}
