import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { BusinessDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { BreakEvenCalculator } from "@/tools/calculadora-punto-equilibrio/BreakEvenCalculator";
import { BreakEvenContent } from "@/tools/calculadora-punto-equilibrio/BreakEvenContent";

const SLUG = "calculadora-punto-equilibrio";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<BreakEvenCalculator />} disclaimer={<BusinessDisclaimer />}>
      <BreakEvenContent />
    </CalculatorLayout>
  );
}
