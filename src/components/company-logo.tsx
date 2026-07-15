import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a company's logo using an uploaded logo URL, falling back to a keyless favicon source
 * if no custom logo is uploaded, and finally displaying a placeholder building icon.
 */
export function CompanyLogo({
  domain,
  name,
  logoUrl,
  size = 40,
  className,
}: {
  domain?: string | null;
  name?: string | null;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [domainFailed, setDomainFailed] = useState(false);

  const showCustomLogo = logoUrl && !logoFailed;
  const showDomainFavicon = domain && !domainFailed;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg border bg-background",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={name ? `${name} logo` : "Company logo"}
    >
      {showCustomLogo ? (
        <img
          src={logoUrl}
          alt={name ? `${name} logo` : "Company logo"}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setLogoFailed(true)}
        />
      ) : showDomainFavicon ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={name ? `${name} logo` : "Company logo"}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-contain p-1.5"
          onError={() => setDomainFailed(true)}
        />
      ) : (
        <Building2 className="h-1/2 w-1/2 text-muted-foreground" />
      )}
    </span>
  );
}
