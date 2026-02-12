import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-white">ProseIQ</div>
            <div className="mt-1 text-xs text-white/60">
              Case management for pro se litigants
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Legal</span>
              <Link href="/privacy" className="text-white/70 transition-colors hover:text-amber-300">Privacy Policy</Link>
              <Link href="/terms" className="text-white/70 transition-colors hover:text-amber-300">Terms of Service</Link>
              <Link href="/cookies" className="text-white/70 transition-colors hover:text-amber-300">Cookie Policy</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Trust</span>
              <Link href="/security" className="text-white/70 transition-colors hover:text-amber-300">Security &amp; Compliance</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} ProseIQ. All rights reserved.</span>
          <span>Your case data is encrypted and securely isolated.</span>
        </div>
      </div>
    </footer>
  );
}
