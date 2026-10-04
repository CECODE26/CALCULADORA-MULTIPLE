import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function SavingsContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>Responde a las dos preguntas más habituales al planificar un ahorro:</p>
      <ul>
        <li>
          <strong>¿Cuánto tendré?</strong> Si ahorras una cantidad fija cada mes, cuánto habrás reunido al final del
          plazo.
        </li>
        <li>
          <strong>¿Cuánto necesito ahorrar?</strong> Qué cantidad mensual necesitas para llegar a un objetivo (un fondo
          de emergencia, un viaje, la entrada de una vivienda) en una fecha determinada.
        </li>
      </ul>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Elige el modo de cálculo.</li>
        <li>Introduce tus importes y el plazo en meses o años.</li>
        <li>
          Si tu dinero genera intereses (cuenta de ahorro, depósito, fondo), añade un rendimiento anual estimado. Si no,
          déjalo vacío.
        </li>
      </ol>

      <h2>Fórmula</h2>
      <p>Sin rendimiento, el cálculo es una suma:</p>
      <Formula>{"Total = Ahorro inicial + Aporte mensual × meses\nAporte necesario = (Objetivo − Ahorro actual) / meses"}</Formula>
      <p>Con rendimiento se aplica interés compuesto mensual con aportes al final de cada mes:</p>
      <Formula>{"Total = S × (1 + i)^N + A × ((1 + i)^N − 1) / i\nA = (Objetivo − S × (1 + i)^N) × i / ((1 + i)^N − 1)"}</Formula>
      <Variables
        items={[
          ["S", "Ahorro inicial o actual."],
          ["A", "Aporte mensual."],
          ["i", "Rendimiento anual estimado / 12, en decimal."],
          ["N", "Número de meses."],
        ]}
      />

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Quieres reunir <strong>10.000</strong> en <strong>3 años</strong> y ya tienes <strong>1.000</strong>. Sin
          rendimiento necesitas apartar <strong>250 al mes</strong> (9.000 / 36). Con un rendimiento estimado del 4 %
          anual, el aporte baja a unos 232 al mes.
        </p>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar el resultado</h2>
      <ul>
        <li>El rendimiento es una <strong>estimación</strong>: tasas, comisiones e impuestos pueden cambiar.</li>
        <li>
          Si el aporte necesario es demasiado alto para tu presupuesto, prueba a ampliar el plazo o ajustar el objetivo.
        </li>
        <li>La tabla anual te permite fijar metas intermedias y revisar si vas por buen camino.</li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Usar rendimientos optimistas.</strong> Para dinero que necesitarás pronto, es prudente calcular con
          rendimiento 0 % o bajo.
        </li>
        <li>
          <strong>No contar la inflación.</strong> Un objetivo a varios años costará más en el futuro.
        </li>
        <li>
          <strong>Ahorrar «lo que sobra».</strong> Programar el aporte al cobrar el sueldo facilita cumplir el plan.
        </li>
      </ul>
      <p>
        Para escenarios de inversión con capitalización y aportes de distinta frecuencia, usa la{" "}
        <Link href="/calculadora-interes-compuesto">calculadora de interés compuesto</Link>.
      </p>
    </>
  );
}
