"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--parchment)", borderBottom: "2px solid var(--ink)",
        padding: "0 20px 0 20px", display: "flex", alignItems: "stretch",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 24px 12px 0", borderRight: "1px solid var(--border)",
          textDecoration: "none", color: "inherit", flexShrink: 0,
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

        {/* Desktop nav links */}
        <div className="desktop-nav-links" style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em",
                textTransform: "uppercase", textDecoration: "none",
                color: active ? "var(--earth)" : "var(--ink-light)",
                padding: "0 14px", height: "100%",
                display: "flex", alignItems: "center",
                borderBottom: active ? "2px solid var(--earth)" : "2px solid transparent",
                marginBottom: -2, transition: "all 0.15s",
              }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="desktop-cta" style={{
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

        {/* Hamburger button — hidden on desktop */}
        <button
          className="hamburger-btn"
          onClick={() => setOpen(true)}
          style={{
            display: "none", marginLeft: "auto",
            alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            padding: "8px", gap: 5, flexDirection: "column",
          }}
          aria-label="Open menu"
        >
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)" }} />
        </button>
      </nav>

      {/* Mobile nav drawer */}
      <div className={`mobile-nav-drawer${open ? " open" : ""}`}>
        {/* Close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <span style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, letterSpacing: "0.06em" }}>CERES</span>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, color: "var(--ink)", lineHeight: 1 }}
            aria-label="Close menu"
          >×</button>
        </div>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.1em",
                  textTransform: "uppercase", textDecoration: "none",
                  color: active ? "var(--earth)" : "var(--ink)",
                  padding: "18px 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                {label}
                <span style={{ color: "var(--ink-light)", fontSize: 18 }}>→</span>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link href={ctaHref} onClick={() => setOpen(false)} style={{
          display: "block", marginTop: 32, textAlign: "center",
          fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em",
          textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)",
          padding: "16px 24px", textDecoration: "none",
        }}>
          {ctaLabel}
        </Link>
      </div>
    </>
  );
}
