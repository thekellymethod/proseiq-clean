import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ProseIQ",
  description: "ProseIQ Terms of Service. Read the terms governing your use of our case management platform for pro se litigants.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
        <p className="mt-2 text-white/70">Last updated: February 10, 2025</p>

        <div className="mt-10 space-y-8 text-white/90">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Agreement to Terms</h2>
            <p className="mt-2">
              By accessing or using ProseIQ (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service. We reserve the right to modify these Terms at any time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
            <p className="mt-2">
              ProseIQ provides case management tools for pro se (self-represented) litigants, including intake, timeline, exhibits, drafting, and export features. The Service is designed to help you organize and prepare your case—it does not constitute legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Not Legal Advice</h2>
            <p className="mt-2">
              ProseIQ is a case management tool, not a law firm or lawyer. Nothing in the Service constitutes legal advice. We do not review your case, filings, or strategy. You are responsible for your legal decisions and for consulting an attorney when appropriate. We recommend seeking professional legal counsel for complex matters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Account &amp; Eligibility</h2>
            <p className="mt-2">
              You must be at least 18 years old and able to form a binding contract. You are responsible for maintaining the confidentiality of your account and for all activity under your account. You must provide accurate information and notify us immediately of any unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Acceptable Use</h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Upload content that infringes rights, is defamatory, or harmful</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; data</li>
              <li>Interfere with or disrupt the Service or its security</li>
              <li>Reverse engineer, copy, or resell the Service</li>
            </ul>
            <p className="mt-2">We may suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Your Content</h2>
            <p className="mt-2">
              You retain ownership of your case data and content. By using the Service, you grant us a limited license to store, process, and display your content as necessary to provide the Service. We do not claim ownership of your content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Subscription &amp; Payments</h2>
            <p className="mt-2">
              Paid plans are billed according to the pricing at signup. You authorize recurring charges until you cancel. Refunds are handled according to our refund policy. We may change pricing with notice; continued use after a price change constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. Security &amp; Compliance</h2>
            <p className="mt-2">
              We implement industry-standard security measures including encryption, access controls, and monitoring. We are committed to SOC 2 compliance and applicable data protection standards. You are responsible for securing your account credentials and for the accuracy of data you enter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">9. Disclaimers</h2>
            <p className="mt-2">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE UNINTERRUPTED ACCESS OR THAT THE SERVICE WILL MEET YOUR SPECIFIC NEEDS. USE AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">10. Limitation of Liability</h2>
            <p className="mt-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROSEIQ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">11. Indemnification</h2>
            <p className="mt-2">
              You agree to indemnify and hold ProseIQ harmless from any claims, damages, or expenses arising from your use of the Service, your content, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">12. Termination</h2>
            <p className="mt-2">
              You may close your account at any time. We may suspend or terminate your access for breach of these Terms or for any other reason. Upon termination, you may export your data during the notice period; we may retain backups as permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">13. Governing Law</h2>
            <p className="mt-2">
              These Terms are governed by the laws of the United States and the state in which ProseIQ operates. Disputes shall be resolved in the appropriate courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">14. Contact</h2>
            <p className="mt-2">
              For questions about these Terms, contact us at: legal@proseiq.com or through our support channels.
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
