import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Compliance | ProseIQ",
  description: "ProseIQ security and compliance. Learn how we protect your case data with encryption, access controls, and industry standards.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen text-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Security &amp; Compliance</h1>
        <p className="mt-2 text-white/70">How we protect your case data</p>

        <div className="mt-10 space-y-8 text-white/90">
          <section>
            <h2 className="text-xl font-semibold text-white">Data Security</h2>
            <p className="mt-2">
              ProseIQ is built with security first. Your case data is encrypted in transit (TLS) and at rest (AES). Each user&apos;s data is logically isolated—we never mix your cases with other users. Access controls ensure only you can view and edit your case information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Infrastructure</h2>
            <p className="mt-2">
              We use industry-leading cloud infrastructure with redundant backups, monitoring, and incident response. Our systems are regularly updated and patched to address known vulnerabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Access Control</h2>
            <p className="mt-2">
              Authentication is required for all access. Passwords are hashed and never stored in plain text. We support secure password reset and recommend strong, unique passwords. Multi-factor authentication (MFA) is available for added protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Compliance</h2>
            <p className="mt-2">
              We are committed to SOC 2 Type II compliance and follow data protection best practices. We comply with applicable privacy laws and do not sell or share your personal information with third parties for marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Your Responsibility</h2>
            <p className="mt-2">
              You are responsible for keeping your account credentials secure, using the service on trusted devices, and not sharing your login with others. If you suspect unauthorized access, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Reporting Security Issues</h2>
            <p className="mt-2">
              If you discover a security vulnerability, please report it to security@proseiq.com. We take all reports seriously and will respond promptly.
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
