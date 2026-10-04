import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/Icon";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label={`${siteConfig.name}: inicio`}>
      <span className="brand__mark">
        <Icon name="calculator" size={18} strokeWidth={2} />
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
