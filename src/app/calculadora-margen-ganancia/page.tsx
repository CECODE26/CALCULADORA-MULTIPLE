import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { BusinessDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { MarginCalculator } from "@/tools/calculadora-margen-ganancia/MarginCalculator";
import { MarginContent } from "@/tools/calculadora-margen-ganancia/MarginContent";

const SLUG = "calculadora-margen-ganancia";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<MarginCalculator />} disclaimer={<BusinessDisclaimer />}>
      <MarginContent />
    </CalculatorLayout>
  );
}
