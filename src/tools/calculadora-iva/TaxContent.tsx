import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function TaxContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>
        Sirve para el IVA y para cualquier impuesto proporcional al precio (IGV, impuesto sobre ventas, etc.). Tú
        indicas la tasa; la herramienta no asume la de ningún país porque cambian con el tiempo y según el producto.
      </p>
      <ul>
        <li>
          <strong>Agregar impuesto:</strong> tienes el precio sin impuesto y quieres el total.
        </li>
        <li>
          <strong>Quitar impuesto:</strong> tienes el total y quieres la base imponible.
        </li>
        <li>
          <strong>Impuesto incluido:</strong> quieres saber cuánto impuesto contiene un precio final y qué porcentaje
          del precio representa.
        </li>
      </ul>

      <h2>Fórmulas</h2>
      <Formula>
        {"Agregar:  Total = Base × (1 + t)\nQuitar:   Base = Total / (1 + t)\nIncluido: Impuesto = Total − Total / (1 + t) = Total × t / (1 + t)"}
      </Formula>
      <Variables
        items={[
          ["Base", "Importe antes de impuestos (base imponible)."],
          ["t", "Tasa del impuesto en decimal (15 % → 0,15)."],
          ["Total", "Precio final con impuesto incluido."],
        ]}
      />

      <h2>Ejemplos</h2>
      <Example>
        <ul>
          <li>Base de 100 con una tasa del 15 %: impuesto 15, total 115.</li>
          <li>Total de 115 con una tasa del 15 %: base 100 (no 97,75, que sería restar el 15 % al total).</li>
          <li>Un precio de 116 con una tasa del 16 % incluye 16 de impuesto, que es el 13,79 % del precio final.</li>
        </ul>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Quitar el impuesto restando el porcentaje al total.</strong> Hay que dividir entre (1 + t).
        </li>
        <li>
          <strong>Usar una tasa desactualizada.</strong> Comprueba siempre la tasa vigente en la autoridad tributaria de
          tu país; puede haber tasas reducidas o productos exentos.
        </li>
        <li>
          <strong>Redondear antes de tiempo.</strong> Redondea solo el resultado final a céntimos para evitar
          diferencias.
        </li>
      </ul>
      <p>
        Si vendes y quieres incluir el impuesto en tu precio junto con costos y comisiones, usa la{" "}
        <Link href="/calculadora-precio-venta">calculadora de precio de venta</Link>.
      </p>
    </>
  );
}
