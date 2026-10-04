import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { FinancialDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { AmortizationCalculator } from "@/tools/tabla-amortizacion/AmortizationCalculator";
import { AmortizationContent } from "@/tools/tabla-amortizacion/AmortizationContent";

const SLUG = "tabla-amortizacion";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<AmortizationCalculator />} disclaimer={<FinancialDisclaimer />}>
      <AmortizationContent />
    </CalculatorLayout>
  );
}
