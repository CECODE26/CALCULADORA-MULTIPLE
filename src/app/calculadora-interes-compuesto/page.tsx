import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { FinancialDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { CompoundCalculator } from "@/tools/calculadora-interes-compuesto/CompoundCalculator";
import { CompoundContent } from "@/tools/calculadora-interes-compuesto/CompoundContent";

const SLUG = "calculadora-interes-compuesto";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<CompoundCalculator />} disclaimer={<FinancialDisclaimer />}>
      <CompoundContent />
    </CalculatorLayout>
  );
}
