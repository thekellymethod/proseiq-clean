import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ProseIQ",
  description: "ProseIQ Privacy Policy. Learn how we collect, use, store, and protect your case data and personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-2 text-white/70">Last updated: February 10, 2025</p>

        <div className="mt-10 space-y-8 text-white/90">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
            <p className="mt-2">
              ProseIQ (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information and case data when you use our case management platform designed for pro se litigants.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
            <p className="mt-2">We collect information you provide directly:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Account information (name, email, password)</li>
              <li>Case data (facts, timelines, exhibits, drafts, filings)</li>
              <li>Payment information (processed securely by our payment provider)</li>
              <li>Communications and support requests</li>
            </ul>
            <p className="mt-2">We automatically collect:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Log data (IP address, browser type, access times)</li>
              <li>Device and usage information to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
            <p className="mt-2">We use your information to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our case management services</li>
              <li>Authenticate your account and protect against unauthorized access</li>
              <li>Process payments and send service-related communications</li>
              <li>Respond to support requests and comply with legal obligations</li>
              <li>Improve security, prevent fraud, and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Data Security &amp; Isolation</h2>
            <p className="mt-2">
              Your case data is stored in an isolated, secure environment. Each user&apos;s data is logically separated from other users. We use industry-standard encryption in transit (TLS) and at rest (AES) to protect your information. We are committed to maintaining SOC 2 compliance and follow security best practices including regular audits and access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Data Sharing</h2>
            <p className="mt-2">
              We do not sell your personal information or case data. We may share information only: (a) with service providers who assist our operations under strict confidentiality; (b) when required by law or to protect our rights; (c) with your consent. We require all third parties to maintain appropriate security and use data only for specified purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
            <p className="mt-2">You may:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Access, correct, or delete your personal information</li>
              <li>Export your case data</li>
              <li>Request data portability</li>
              <li>Opt out of marketing communications</li>
              <li>Contact us at any time regarding your privacy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Data Retention</h2>
            <p className="mt-2">
              We retain your data for as long as your account is active or as needed to provide services. After account closure, we may retain certain data for legal, security, or audit purposes as permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. Cookies &amp; Tracking</h2>
            <p className="mt-2">
              We use essential cookies for authentication and security. We may use analytics cookies to improve our service. You can manage cookie preferences in your browser settings. See our <Link href="/cookies" className="text-amber-300 underline hover:text-amber-200">Cookie Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">9. Children</h2>
            <p className="mt-2">
              Our services are not intended for users under 18. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">10. Changes</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or a notice on our site. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">11. Contact Us</h2>
            <p className="mt-2">
              For privacy questions or requests, contact us at: privacy@proseiq.com or through our support channels.
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
