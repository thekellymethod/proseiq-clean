export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-black/10">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} ProseIQ</div>
          <div className="text-white/50">
            Not legal advice. Tools for organization, drafting, and workflow.
          </div>
        </div>
      </div>
    </footer>
  );
}
