import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { toolMetadata } from "@/lib/seo";
import { DiscountCalculator } from "@/tools/calculadora-descuentos/DiscountCalculator";
import { DiscountContent } from "@/tools/calculadora-descuentos/DiscountContent";

const SLUG = "calculadora-descuentos";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<DiscountCalculator />}>
      <DiscountContent />
    </CalculatorLayout>
  );
}
