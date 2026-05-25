import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

/**
 * Footer — site-wide footer.
 * Faithful port of pirxey-website-nextjs/src/components/layout/footer/index.tsx
 * with Sanity coupling removed (data passed as props).
 */

export type FooterProps = {
  /** Plain-text or React address block. */
  address?: React.ReactNode;
  contactTitle?: string;
  contactEmail?: { text: string; href: string };
  /** Sales person contact panel. */
  sales?: {
    avatarUrl?: string;
    name: string;
    title?: string;
    number?: string;
    email?: string;
  };
  /** Optional small "Reach out to X directly" label above the sales card. */
  salesIntro?: string;
};

export function Footer({
  address,
  contactTitle = "Have a question?",
  contactEmail,
  sales,
  salesIntro,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "grid-container clip-corners-t-4 relative bg-surface-light-100 py-section-padding text-text-on-light-primary",
        styles.footer
      )}
    >
      <div className="flex flex-col items-center justify-between gap-y-4 pb-6 lg:flex-row">
        {/* Logo + address */}
        <div className="flex shrink-0 flex-col items-center gap-4 lg:items-start">
          <img
            src="/assets/svg/pirxey-logo-on-light.svg"
            alt="Pirxey"
            width={203}
            height={54}
            className="h-13 w-auto"
          />
          {address && (
            <div className="typography-heading-5 text-text-on-light-secondary max-lg:text-center">
              {address}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-2 text-center max-lg:py-6 lg:text-start">
          <h2 className="typography-heading-4">{contactTitle}</h2>
          {contactEmail && (
            <a
              href={contactEmail.href}
              className="typography-heading-5 text-text-accent-on-light underline decoration-transparent transition-all hover:text-accent-primary-hover hover:decoration-current"
            >
              {contactEmail.text}
            </a>
          )}
        </div>

        {/* Sales card */}
        {sales && (
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            {sales.avatarUrl ? (
              <img
                src={sales.avatarUrl}
                alt={sales.name}
                width={64}
                height={64}
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="size-16 rounded-full bg-surface-light-200 flex items-center justify-center typography-heading-4">
                {sales.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            )}
            <div className="text-center lg:text-start">
              {salesIntro && (
                <p className="typography-meta text-text-on-light-secondary">
                  {salesIntro}
                </p>
              )}
              <p className="typography-heading-5">{sales.name}</p>
              {sales.title && (
                <p className="typography-meta text-text-on-light-secondary">
                  {sales.title}
                </p>
              )}
              <div className="flex flex-col lg:flex-row gap-1 lg:gap-3 mt-1">
                {sales.email && (
                  <a
                    href={`mailto:${sales.email}`}
                    className="typography-meta text-text-accent-on-light underline decoration-transparent hover:decoration-current"
                  >
                    {sales.email}
                  </a>
                )}
                {sales.number && (
                  <a
                    href={`tel:${sales.number.replace(/\s/g, "")}`}
                    className="typography-meta text-text-accent-on-light underline decoration-transparent hover:decoration-current"
                  >
                    {sales.number}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 pt-6 border-t border-border-on-light-subtle/40 lg:flex-row lg:justify-between">
        <p className="typography-meta text-text-on-light-secondary">
          © {year} Pirxey. All rights reserved.
        </p>
        <p className="typography-meta text-text-on-light-secondary">
          Custom software development. AI-First. Talent from across Poland.
        </p>
      </div>
    </footer>
  );
}
