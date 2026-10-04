import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula } from "@/components/content/Content";

export function DiscountContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <ul>
        <li>
          <strong>Simple:</strong> el precio final y cuánto ahorras con un descuento.
        </li>
        <li>
          <strong>Sucesivos:</strong> el precio y el descuento real cuando se aplican varias rebajas una tras otra (por
          ejemplo, 20 % + 10 % adicional en caja).
        </li>
        <li>
          <strong>¿Qué % me descuentan?:</strong> el porcentaje real de descuento a partir del precio original y el que
          pagas.
        </li>
      </ul>

      <h2>Fórmulas</h2>
      <Formula>{"Ahorro = Precio × Descuento / 100\nPrecio final = Precio × (1 − Descuento / 100)"}</Formula>
      <h3>Descuentos sucesivos</h3>
      <Formula>{"Precio final = Precio × (1 − d₁) × (1 − d₂) × …\nDescuento efectivo = 1 − (1 − d₁) × (1 − d₂) × …"}</Formula>
      <h3>Descuento real entre dos precios</h3>
      <Formula>{"Descuento % = (Precio original − Precio final) / Precio original × 100"}</Formula>

      <h2>¿Por qué 20 % + 10 % no es 30 %?</h2>
      <p>
        El segundo descuento se calcula sobre el precio <strong>ya rebajado</strong>, no sobre el original. En un
        producto de 100, el 20 % lo deja en 80, y el 10 % adicional se aplica sobre 80 (−8), con un precio final de{" "}
        <strong>72</strong>. El descuento total es del <strong>28 %</strong>. El orden de los descuentos no cambia el
        resultado.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Unas zapatillas de <strong>120</strong> rebajadas a <strong>90</strong>: (120 − 90) / 120 × 100 ={" "}
          <strong>25 % de descuento</strong> real.
        </p>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Errores frecuentes</h2>
      <ul>
        <li>Sumar descuentos sucesivos como si fueran uno solo.</li>
        <li>
          Pensar que «70 % + 30 %» deja el producto gratis: en realidad el descuento total es del 79 %.
        </li>
        <li>
          Comparar ofertas sin comprobar el precio original: un «50 %» sobre un precio inflado puede ser peor que un
          20 % sobre el precio habitual.
        </li>
      </ul>
      <p>
        ¿Vendes y quieres saber cuánto margen te queda tras una rebaja? Usa la{" "}
        <Link href="/calculadora-margen-ganancia">calculadora de margen</Link>. Para otros cálculos, prueba la{" "}
        <Link href="/calculadora-porcentajes">calculadora de porcentajes</Link>.
      </p>
    </>
  );
}
