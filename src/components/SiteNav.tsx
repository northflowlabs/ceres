"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const PRIMARY_LINKS = [
  { href: "/",            label: "Dashboard"   },
  { href: "/regions",     label: "Regions"     },
  { href: "/map",         label: "Map"         },
  { href: "/subnational", label: "Sub-national" },
  { href: "/methodology", label: "Methodology" },
  { href: "/api-access",  label: "API"         },
  { href: "/about",       label: "About"       },
];

const MORE_LINKS = [
  { href: "/tracker",    label: "Track Record" },
  { href: "/validation", label: "Validation"   },
  { href: "/impact",     label: "Impact"       },
  { href: "/data",       label: "Data"         },
  { href: "/changelog",  label: "Changelog"    },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS, { href: "/login", label: "Sign In" }];

const MOBILE_BREAKPOINT = 1024;

export default function SiteNav({ ctaHref = "/login", ctaLabel = "Sign In →" }: { ctaHref?: string; ctaLabel?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (top) window.scrollTo(0, -parseInt(top, 10));
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [open]);

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
          <img src="/ceres-logo-web.png" alt="CERES" width={36} height={36} style={{ flexShrink: 0, borderRadius: "50%" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1 }}>CERES</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.14em", color: "var(--ink-light)", textTransform: "uppercase", marginTop: 3 }}>
              Probabilistic Famine Early Warning
            </span>
          </div>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 8px", flexShrink: 1, minWidth: 0 }}>
            {PRIMARY_LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.10em",
                  textTransform: "uppercase", textDecoration: "none",
                  color: active ? "var(--earth)" : "var(--ink-light)",
                  padding: "0 10px", height: "100%",
                  display: "flex", alignItems: "center", whiteSpace: "nowrap",
                  borderBottom: active ? "2px solid var(--earth)" : "2px solid transparent",
                  marginBottom: -2, transition: "all 0.15s",
                }}>
                  {label}
                </Link>
              );
            })}
            {/* More dropdown */}
            <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button style={{
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.10em",
                textTransform: "uppercase", background: "none", border: "none",
                color: MORE_LINKS.some(l => pathname.startsWith(l.href)) ? "var(--earth)" : "var(--ink-light)",
                padding: "0 10px", height: "100%", cursor: "pointer", whiteSpace: "nowrap",
                borderBottom: MORE_LINKS.some(l => pathname.startsWith(l.href)) ? "2px solid var(--earth)" : "2px solid transparent",
                marginBottom: -2,
              }}>
                More ▾
              </button>
              {moreOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, zIndex: 2000,
                  background: "var(--parchment)", border: "1px solid var(--border)",
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.08)", minWidth: 160,
                }}>
                  {MORE_LINKS.map(({ href, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                      <Link key={href} href={href} onClick={() => setMoreOpen(false)} style={{
                        display: "block", padding: "10px 16px",
                        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.10em",
                        textTransform: "uppercase", textDecoration: "none",
                        color: active ? "var(--earth)" : "var(--ink-light)",
                        borderBottom: "1px solid var(--border-light)",
                        background: active ? "var(--parchment-dark)" : "transparent",
                      }}>
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop CTA — hidden on mobile */}
        {!isMobile && (
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
        )}

        {/* Hamburger button — shown on mobile only */}
        {isMobile && (
          <button
            onClick={() => setOpen(true)}
            style={{
              display: "flex", marginLeft: "auto",
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
        )}
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
          {ALL_LINKS.map(({ href, label }) => {
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
