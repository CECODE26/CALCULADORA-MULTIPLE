import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula } from "@/components/content/Content";

export function HoursContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>
        Calcula el tiempo efectivamente trabajado a partir de la hora de entrada, la de salida y el descanso. En el modo
        semanal suma cada día y obtiene el total y el promedio. Funciona con <strong>turnos nocturnos</strong> que
        terminan al día siguiente.
      </p>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Introduce las horas en formato de 24 horas (por ejemplo, 22:00).</li>
        <li>Indica los minutos de descanso no remunerado (almuerzo, pausas).</li>
        <li>En modo semanal, marca los días trabajados y completa su horario.</li>
      </ol>

      <h2>Fórmula</h2>
      <Formula>
        {"Tiempo = Salida − Entrada   (si Salida < Entrada, se suman 24 h)\nTrabajado = Tiempo − Descanso\nHoras decimales = Minutos trabajados / 60"}
      </Formula>

      <h2>Ejemplos</h2>
      <Example>
        <ul>
          <li>08:00 a 17:00 con 60 min de descanso = 8 h 00 min (8,00 h decimales).</li>
          <li>22:00 a 06:00 sin descanso = 8 h (el turno cruza la medianoche).</li>
          <li>09:00 a 16:20 = 7 h 20 min = 7,33 h decimales.</li>
        </ul>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Horas decimales: cómo interpretarlas</h2>
      <p>
        Muchas nóminas y hojas de cálculo usan horas decimales: 7 h 30 min son <strong>7,5</strong> horas, no 7,30. Para
        convertir, divide los minutos entre 60: 20 min = 0,33 h; 45 min = 0,75 h.
      </p>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>Escribir 7,30 h cuando se quiere decir 7 h 30 min (7,5 h).</li>
        <li>Olvidar restar el descanso no remunerado.</li>
        <li>Restar mal los turnos nocturnos: de 22:00 a 06:00 no son −16 h sino 8 h.</li>
      </ul>
      <p>
        Esta herramienta no calcula recargos por horas extra, nocturnas o festivas, que dependen de la legislación de
        cada país. Para calcular un porcentaje de recargo, puedes usar la{" "}
        <Link href="/calculadora-porcentajes">calculadora de porcentajes</Link>.
      </p>
    </>
  );
}
