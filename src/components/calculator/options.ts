import type { Option } from "@/components/ui/Select";
import type { RateType, TermUnit } from "@/lib/calc/rates";

export const rateTypeOptions: Option<RateType>[] = [
  { value: "nominal-annual", label: "anual nominal" },
  { value: "effective-annual", label: "anual efectiva" },
  { value: "monthly", label: "mensual" },
];

export const termUnitOptions: Option<TermUnit>[] = [
  { value: "years", label: "años" },
  { value: "months", label: "meses" },
];

export const frequencyOptions: Option<string>[] = [
  { value: "12", label: "Mensual" },
  { value: "24", label: "Quincenal (24 al año)" },
  { value: "26", label: "Catorcenal (cada 2 semanas)" },
  { value: "52", label: "Semanal" },
  { value: "6", label: "Bimestral" },
  { value: "4", label: "Trimestral" },
  { value: "2", label: "Semestral" },
  { value: "1", label: "Anual" },
];

/** Adjetivo de la cuota según la frecuencia: "Cuota mensual", "Cuota trimestral"… */
export const frequencyAdjective: Record<string, string> = {
  "52": "semanal",
  "26": "catorcenal",
  "24": "quincenal",
  "12": "mensual",
  "6": "bimestral",
  "4": "trimestral",
  "2": "semestral",
  "1": "anual",
};
