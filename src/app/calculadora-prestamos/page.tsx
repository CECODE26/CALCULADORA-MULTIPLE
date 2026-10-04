import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { FinancialDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { LoanCalculator } from "@/tools/calculadora-prestamos/LoanCalculator";
import { LoanContent } from "@/tools/calculadora-prestamos/LoanContent";

const SLUG = "calculadora-prestamos";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<LoanCalculator />} disclaimer={<FinancialDisclaimer />}>
      <LoanContent />
    </CalculatorLayout>
  );
}
