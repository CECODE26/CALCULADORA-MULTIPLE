import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { FinancialDisclaimer } from "@/components/content/Content";
import { toolMetadata } from "@/lib/seo";
import { LenderSimulator } from "@/tools/simulador-credito-ecuador/LenderSimulator";
import { LenderContent, RatesDisclaimer } from "@/tools/simulador-credito-ecuador/LenderContent";

const SLUG = "simulador-credito-ecuador";
export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      calculator={<LenderSimulator />}
      disclaimer={
        <>
          <RatesDisclaimer />
          <FinancialDisclaimer />
        </>
      }
    >
      <LenderContent />
    </CalculatorLayout>
  );
}
