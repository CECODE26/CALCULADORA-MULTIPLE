import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { BusinessDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { TaxCalculator } from "@/tools/calculadora-iva/TaxCalculator";
import { TaxContent } from "@/tools/calculadora-iva/TaxContent";

const SLUG = "calculadora-iva";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<TaxCalculator />} disclaimer={<BusinessDisclaimer />}>
      <TaxContent />
    </CalculatorLayout>
  );
}
