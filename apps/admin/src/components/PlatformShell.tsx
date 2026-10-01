import { StoreIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import type { MerchantUser } from "@/lib/server-auth";

export default function PlatformShell({ admin, children }: { admin: MerchantUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            <StoreIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Vertex Platform</span>
            <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              Admin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {admin.firstName} {admin.lastName}
          </span>
          <div className="w-32">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
