import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { toolMetadata } from "@/lib/seo";
import { HoursCalculator } from "@/tools/calculadora-horas-trabajadas/HoursCalculator";
import { HoursContent } from "@/tools/calculadora-horas-trabajadas/HoursContent";

const SLUG = "calculadora-horas-trabajadas";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<HoursCalculator />}>
      <HoursContent />
    </CalculatorLayout>
  );
}
