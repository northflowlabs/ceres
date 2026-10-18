import { notFound } from "next/navigation";

// Accounts, sign-in and API sign-up are closed on the public site.
// The page code stays in the repository; the route answers 404.
export default function Layout({ children }: { children: React.ReactNode }) {
  notFound();
  return <>{children}</>;
}
