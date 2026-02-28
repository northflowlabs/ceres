"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",            label: "Dashboard"    },
  { href: "/methodology", label: "Methodology"  },
  { href: "/data",        label: "Data Sources" },
  { href: "/validation",  label: "Validation"   },
  { href: "/about",       label: "About"        },
  { href: "/api-access",  label: "API"          },
];

export default function SiteNav({ ctaHref = "/api-access", ctaLabel = "Access API →" }: { ctaHref?: string; ctaLabel?: string }) {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--parchment)", borderBottom: "2px solid var(--ink)",
      padding: "0 40px", display: "flex", alignItems: "stretch",
    }}>
      <Link href="/" style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 32px 12px 0", borderRight: "1px solid var(--border)",
        textDecoration: "none", color: "inherit",
      }}>
        <div style={{
          width: 32, height: 32, border: "2px solid var(--ink)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <div style={{ width: 8, height: 8, background: "var(--earth)", borderRadius: "50%" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1 }}>CERES</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.14em", color: "var(--ink-light)", textTransform: "uppercase", marginTop: 3 }}>
            Famine Intelligence · HGE #5
          </span>
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              color: active ? "var(--earth)" : "var(--ink-light)",
              padding: "0 16px", height: "100%",
              display: "flex", alignItems: "center",
              borderBottom: active ? "2px solid var(--earth)" : "2px solid transparent",
              marginBottom: -2,
              transition: "all 0.15s",
            }}>
              {label}
            </Link>
          );
        })}
      </div>

      <div style={{
        marginLeft: "auto", display: "flex", alignItems: "center",
        paddingLeft: 24, borderLeft: "1px solid var(--border)",
      }}>
        <Link href={ctaHref} style={{
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em",
          textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)",
          padding: "8px 16px", textDecoration: "none",
        }}>
          {ctaLabel}
        </Link>
      </div>
    </nav>
  );
}
