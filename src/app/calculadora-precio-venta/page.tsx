import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { BusinessDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { PricingCalculator } from "@/tools/calculadora-precio-venta/PricingCalculator";
import { PricingContent } from "@/tools/calculadora-precio-venta/PricingContent";

const SLUG = "calculadora-precio-venta";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout slug={SLUG} calculator={<PricingCalculator />} disclaimer={<BusinessDisclaimer />}>
      <PricingContent />
    </CalculatorLayout>
  );
}
