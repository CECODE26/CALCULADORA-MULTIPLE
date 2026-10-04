import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function PricingContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>
        Calcula el precio al que debes vender un producto para cubrir <strong>todos</strong> sus costos y obtener el
        margen que buscas. El modo avanzado incluye envío, empaque, otros gastos, la comisión de la plataforma o
        pasarela de pago y el impuesto sobre la venta.
      </p>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Introduce el costo del producto y el margen que quieres obtener.</li>
        <li>
          En modo avanzado, añade los gastos variables por unidad y el porcentaje de comisión (por ejemplo, de un
          marketplace o del cobro con tarjeta).
        </li>
        <li>
          Si debes cobrar impuesto, escribe la tasa vigente en tu país. La herramienta no aplica ninguna tasa por
          defecto porque cambian según el país y el producto.
        </li>
      </ol>

      <h2>Fórmula</h2>
      <Formula>
        {"Costo real = Costo + Transporte + Empaque + Otros\nPrecio sin impuesto = Costo real / (1 − Comisión − Margen)\nImpuesto = Precio sin impuesto × Tasa\nPrecio final = Precio sin impuesto + Impuesto"}
      </Formula>
      <Variables
        items={[
          ["Comisión", "Porcentaje que cobra la plataforma sobre el precio, en decimal."],
          ["Margen", "Ganancia deseada como porcentaje del precio sin impuesto, en decimal."],
          ["Tasa", "Impuesto sobre la venta que indiques (IVA, IGV, sales tax…)."],
        ]}
      />
      <p>
        Si la plataforma cobra la comisión sobre el precio con impuesto incluido, el denominador pasa a ser{" "}
        <code>1 − Comisión × (1 + Tasa) − Margen</code>. La comisión y el margen juntos deben sumar menos del 100 %.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Producto de <strong>50</strong> con 5 de envío, 3 de empaque y 2 de otros gastos (costo real 60), comisión
          del <strong>10 %</strong>, margen del <strong>30 %</strong> e impuesto del <strong>15 %</strong>:
        </p>
        <ul>
          <li>Precio sin impuesto = 60 / (1 − 0,10 − 0,30) = 100</li>
          <li>Comisión = 10 · Ganancia = 30 · Impuesto = 15</li>
          <li>
            Precio final = <strong>115</strong>
          </li>
        </ul>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar el resultado</h2>
      <ul>
        <li>
          El <strong>precio antes de impuestos</strong> es tu ingreso real; el impuesto lo cobras al cliente pero debes
          declararlo.
        </li>
        <li>La barra muestra qué parte del precio se va en costos, comisión y ganancia.</li>
        <li>Si el precio resultante no es competitivo, revisa costos o ajusta el margen.</li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>
          <strong>Sumar la comisión al costo como si fuera fija.</strong> Al ser un porcentaje del precio, crece cuando
          sube el precio.
        </li>
        <li>
          <strong>Calcular el margen sobre el precio con impuesto.</strong> El impuesto no es ganancia.
        </li>
        <li>
          <strong>Ignorar los gastos fijos.</strong> El margen debe cubrir alquiler, sueldos y otros costos fijos; revisa
          tu <Link href="/calculadora-punto-equilibrio">punto de equilibrio</Link>.
        </li>
      </ul>
      <p>
        Si solo necesitas comparar costo y precio, usa la{" "}
        <Link href="/calculadora-margen-ganancia">calculadora de margen de ganancia</Link>. Para desglosar un impuesto,
        prueba la <Link href="/calculadora-iva">calculadora de IVA</Link>.
      </p>
    </>
  );
}
