import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { toolMetadata } from "@/lib/seo";
import { PercentageCalculator } from "@/tools/calculadora-porcentajes/PercentageCalculator";
import { PercentageContent } from "@/tools/calculadora-porcentajes/PercentageContent";

const SLUG = "calculadora-porcentajes";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<PercentageCalculator />}>
      <PercentageContent />
    </CalculatorLayout>
  );
}
