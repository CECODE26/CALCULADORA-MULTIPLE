import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Example, Formula, Variables } from "@/components/content/Content";

export function BreakEvenContent() {
  return (
    <>
      <h2>¿Qué es el punto de equilibrio?</h2>
      <p>
        Es el volumen de ventas en el que los ingresos cubren exactamente todos los costos: no hay ganancia ni pérdida.
        A partir de ahí, cada unidad vendida aporta utilidad. Conocerlo ayuda a fijar precios, metas de ventas y
        decidir si un negocio es viable.
      </p>

      <h2>Cómo utilizarla</h2>
      <ol>
        <li>Suma tus costos fijos del periodo (normalmente un mes).</li>
        <li>Introduce el precio de venta y el costo variable de cada unidad.</li>
        <li>Usa el simulador para ver la utilidad o pérdida con distintas cantidades de ventas.</li>
      </ol>

      <h2>Fórmulas</h2>
      <Formula>
        {"Margen de contribución = Precio − Costo variable unitario\nPunto de equilibrio (unidades) = Costos fijos / Margen de contribución\nPunto de equilibrio (ventas) = Unidades × Precio"}
      </Formula>
      <Variables
        items={[
          ["Costos fijos", "No cambian con el volumen de ventas: alquiler, sueldos fijos, seguros, software."],
          ["Costo variable", "Cambia con cada unidad: materiales, empaque, comisiones, envío."],
          ["Margen de contribución", "Lo que deja cada unidad para cubrir los costos fijos."],
        ]}
      />
      <p>
        Si el resultado tiene decimales se redondea hacia arriba, porque no se pueden vender fracciones de unidad. Si el
        precio no supera el costo variable, el punto de equilibrio no existe: cada venta aumenta la pérdida.
      </p>

      <h2>Ejemplo</h2>
      <Example>
        <p>
          Costos fijos de <strong>5.000</strong> al mes, precio de <strong>25</strong> y costo variable de{" "}
          <strong>15</strong>. El margen de contribución es 10, así que necesitas vender{" "}
          <strong>500 unidades</strong> (12.500 en ventas) para no perder dinero. Si vendes 600, tu utilidad es 1.000.
        </p>
      </Example>

      <AdSlot placement="toolInContent" />

      <h2>Cómo interpretar el resultado</h2>
      <ul>
        <li>En el gráfico, la zona a la izquierda del cruce es pérdida y a la derecha, utilidad.</li>
        <li>Un margen de contribución alto hace que el punto de equilibrio llegue antes.</li>
        <li>Compara el resultado con tu capacidad real de producción y de ventas.</li>
      </ul>

      <h2>Errores frecuentes</h2>
      <ul>
        <li>Olvidar costos fijos «pequeños» (suscripciones, contador, mantenimiento).</li>
        <li>Mezclar periodos: costos fijos mensuales con ventas anuales.</li>
        <li>Suponer un único precio cuando vendes varios productos; en ese caso usa un precio y costo medio ponderado.</li>
      </ul>
      <p>
        Para ajustar el precio a tus costos usa la <Link href="/calculadora-precio-venta">calculadora de precio de venta</Link>{" "}
        o revisa tu <Link href="/calculadora-margen-ganancia">margen de ganancia</Link>.
      </p>
    </>
  );
}
