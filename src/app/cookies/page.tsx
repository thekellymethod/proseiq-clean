import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | ProseIQ",
  description: "ProseIQ Cookie Policy. Learn how we use cookies and similar technologies on our case management platform.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Cookie Policy</h1>
        <p className="mt-2 text-white/70">Last updated: February 10, 2025</p>

        <div className="mt-10 space-y-8 text-white/90">
          <section>
            <h2 className="text-xl font-semibold text-white">1. What Are Cookies</h2>
            <p className="mt-2">
              Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep you signed in, and understand how our service is used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. How We Use Cookies</h2>
            <p className="mt-2">We use cookies for:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Essential:</strong> Authentication, security, and keeping your session active</li>
              <li><strong>Performance:</strong> Understanding how our site performs and where to improve</li>
              <li><strong>Preferences:</strong> Remembering your settings and choices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Cookie Types</h2>
            <p className="mt-2">
              <strong>Strictly necessary:</strong> Required for the service to function. Cannot be disabled.<br />
              <strong>Functional:</strong> Enhance your experience. Can be disabled in browser settings.<br />
              <strong>Analytics:</strong> Help us improve reliability and performance. Can be managed via preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Your Choices</h2>
            <p className="mt-2">
              You can control cookies through your browser settings. Disabling essential cookies may affect your ability to sign in and use the service. For more on your privacy rights, see our <Link href="/privacy" className="text-amber-300 underline hover:text-amber-200">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Contact</h2>
            <p className="mt-2">
              Questions? Contact us at privacy@proseiq.com.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <Link href="/" className="text-amber-300 hover:text-amber-200">← Back to home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
