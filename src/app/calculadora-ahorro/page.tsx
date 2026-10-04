import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { FinancialDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { SavingsCalculator } from "@/tools/calculadora-ahorro/SavingsCalculator";
import { SavingsContent } from "@/tools/calculadora-ahorro/SavingsContent";

const SLUG = "calculadora-ahorro";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<SavingsCalculator />} disclaimer={<FinancialDisclaimer />}>
      <SavingsContent />
    </CalculatorLayout>
  );
}
