import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula } from "@/components/content/Content";

export function PercentageContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>
        Resuelve los siete cálculos de porcentajes más habituales y muestra la operación utilizada, para que puedas
        repetirla a mano o en una hoja de cálculo.
      </p>

      <h2>Cómo utilizarla</h2>
      <p>Elige qué quieres calcular, escribe los dos valores y el resultado aparece al instante con su explicación.</p>

      <h2>Fórmulas</h2>
      <h3>1. X % de Y</h3>
      <Formula>{"Resultado = X / 100 × Y"}</Formula>
      <h3>2. ¿Qué porcentaje es X de Y?</h3>
      <Formula>{"Porcentaje = X / Y × 100"}</Formula>
      <h3>3 y 4. Aumentar o reducir en X %</h3>
      <Formula>{"Aumento:   Y × (1 + X / 100)\nReducción: Y × (1 − X / 100)"}</Formula>
      <h3>5. Cambio porcentual</h3>
      <Formula>{"Cambio % = (Valor final − Valor inicial) / |Valor inicial| × 100"}</Formula>
      <h3>6 y 7. Valor original</h3>
      <Formula>{"Antes de un aumento:   Final / (1 + X / 100)\nAntes de un descuento: Final / (1 − X / 100)"}</Formula>

      <h2>Ejemplos</h2>
      <Example>
        <ul>
          <li>El 15 % de 200 es 30.</li>
          <li>30 es el 15 % de 200.</li>
          <li>Un precio de 80 que pasa a 100 sube un 25 %; si vuelve de 100 a 80, baja un 20 %.</li>
          <li>Si un precio con un 15 % de aumento es 115, el original era 100 (no 97,75).</li>
        </ul>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Deshacer un porcentaje restando el mismo porcentaje.</strong> Subir un 20 % y luego bajar un 20 % no
          devuelve al valor inicial: 100 → 120 → 96.
        </li>
        <li>
          <strong>Confundir puntos porcentuales con porcentaje.</strong> Pasar de una tasa del 10 % al 12 % es un aumento
          de 2 puntos porcentuales, pero un 20 % de aumento relativo.
        </li>
        <li>
          <strong>Calcular el cambio sobre el valor equivocado.</strong> El cambio porcentual siempre se divide entre el
          valor inicial.
        </li>
      </ul>
      <p>
        Para rebajas combinadas usa la <Link href="/calculadora-descuentos">calculadora de descuentos</Link>, y para
        impuestos la <Link href="/calculadora-iva">calculadora de IVA</Link>.
      </p>
    </>
  );
}
