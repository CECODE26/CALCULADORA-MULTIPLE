import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

const TABLE = [10, 20, 25, 30, 40, 50, 60];

export function MarginContent() {
  return (
    <>
      <h2>¿Qué calcula?</h2>
      <p>
        Calcula la <strong>ganancia</strong>, el <strong>margen</strong> y el <strong>markup</strong> de un producto o
        servicio. También puedes hacer el cálculo inverso: a partir del costo y del margen (o markup) que quieres,
        obtener el precio de venta necesario.
      </p>

      <h2>Margen ≠ markup</h2>
      <p>Es la confusión más común al fijar precios. Ambos parten de la misma ganancia, pero se dividen por cosas distintas:</p>
      <Formula>{"Ganancia = Precio − Costo\nMargen = Ganancia / Precio × 100\nMarkup = Ganancia / Costo × 100"}</Formula>
      <p>
        Si compras a 60 y vendes a 100, ganas 40: el <strong>margen es 40 %</strong> (40 de cada 100 que cobras), pero
        el <strong>markup es 66,7 %</strong> (le sumaste al costo dos tercios de su valor). Si aplicas un 40 % de
        recargo sobre el costo pensando que obtienes un 40 % de margen, en realidad tu margen será del 28,6 %.
      </p>
      <h3>Equivalencias frecuentes</h3>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Equivalencias entre margen y markup">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Margen</th>
              <th scope="col">Markup equivalente</th>
            </tr>
          </thead>
          <tbody>
            {TABLE.map((m) => (
              <tr key={m}>
                <th scope="row" style={{ fontWeight: 500 }}>
                  {m} %
                </th>
                <td>{((m / (100 - m)) * 100).toFixed(1).replace(".", ",")} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Cómo calcular el precio para un margen</h2>
      <Formula>{"Precio = Costo / (1 − Margen)\nPrecio = Costo × (1 + Markup)"}</Formula>
      <Variables
        items={[
          ["Costo", "Lo que te cuesta cada unidad."],
          ["Margen", "En decimal: 30 % → 0,30. Debe ser menor que 1 (100 %)."],
          ["Markup", "En decimal: 50 % → 0,50. Puede ser mayor que 100 %."],
        ]}
      />

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Un producto cuesta <strong>60</strong> y quieres un <strong>margen del 40 %</strong>: precio = 60 / (1 − 0,40)
          = <strong>100</strong>. Si en cambio aplicas un <strong>markup del 40 %</strong>: precio = 60 × 1,40 ={" "}
          <strong>84</strong>, con un margen real del 28,6 %.
        </p>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar el resultado</h2>
      <ul>
        <li>El margen indica qué parte de cada venta te queda para cubrir gastos fijos y obtener beneficio.</li>
        <li>Un margen negativo significa que vendes por debajo del costo.</li>
        <li>
          Este es el <strong>margen bruto</strong> por unidad: no incluye alquiler, sueldos, comisiones ni impuestos.
        </li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>Calcular el precio con «costo × 1,3» creyendo obtener un 30 % de margen.</li>
        <li>Olvidar costos de envío, empaque o comisiones de la plataforma de pago.</li>
        <li>Comparar márgenes de productos con precios que incluyen impuestos y otros que no.</li>
      </ul>
      <p>
        Para incluir envío, comisiones e impuestos usa la{" "}
        <Link href="/calculadora-precio-venta">calculadora de precio de venta</Link>. Para saber cuántas unidades
        necesitas vender para cubrir tus gastos fijos, usa la{" "}
        <Link href="/calculadora-punto-equilibrio">calculadora de punto de equilibrio</Link>.
      </p>
    </>
  );
}
