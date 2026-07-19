import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth-actions";
import { Shield, FileText, User, LogOut, CheckCircle2 } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?clear=1");
  }

  const roleLabel = {
    EMPLOYEE: "Employee Workspace",
    DIRECTOR: "Director Review Portal",
    ACCOUNTS: "Accounts Ledger",
  }[user.role];

  const roleColor = {
    EMPLOYEE: "bg-blue-50/80 text-blue-800 border-blue-150/40",
    DIRECTOR: "bg-purple-50/80 text-purple-800 border-purple-150/40",
    ACCOUNTS: "bg-emerald-50/80 text-emerald-800 border-emerald-150/40",
  }[user.role];

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50">
      {/* Background Liquid Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/30 blur-[120px] mix-blend-multiply filter animate-blob-1 pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-200/30 blur-[140px] mix-blend-multiply filter animate-blob-2 pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] w-[45vw] h-[45vw] rounded-full bg-sky-200/25 blur-[110px] mix-blend-multiply filter animate-blob-3 pointer-events-none" />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 border-r border-white/20 bg-white/40 backdrop-blur-xl shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 px-6 hover:opacity-85 transition">
            <Image src="/logo.png" alt="Vouchr" width={160} height={48} className="h-10 w-auto" priority />
          </Link>

          {/* Role Indicator */}
          <div className="px-4 mt-6">
            <div className={`rounded-xl border border-white/40 px-3.5 py-2.5 text-xs font-bold shadow-sm backdrop-blur-md ${roleColor}`}>
              {roleLabel}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 mt-6 space-y-1">
            {user.role === "EMPLOYEE" && (
              <a
                href="/dashboard/employee"
                className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-700 bg-white/40 border border-transparent hover:border-white/30 hover:bg-white/70 hover:text-slate-950 transition duration-200"
              >
                <FileText className="flex-shrink-0 w-4 h-4 mr-3 text-indigo-600" />
                My Vouchers
              </a>
            )}

            {user.role === "DIRECTOR" && (
              <a
                href="/dashboard/director"
                className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-700 bg-white/40 border border-transparent hover:border-white/30 hover:bg-white/70 hover:text-slate-950 transition duration-200"
              >
                <CheckCircle2 className="flex-shrink-0 w-4 h-4 mr-3 text-purple-650" />
                Review Queue
              </a>
            )}

            {user.role === "ACCOUNTS" && (
              <a
                href="/dashboard/accounts"
                className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl text-slate-700 bg-white/40 border border-transparent hover:border-white/30 hover:bg-white/70 hover:text-slate-950 transition duration-200"
              >
                <Shield className="flex-shrink-0 w-4 h-4 mr-3 text-emerald-650" />
                Accounts Ledger
              </a>
            )}
          </nav>

          {/* User profile & Logout */}
          <div className="flex-shrink-0 flex border-t border-white/20 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center text-slate-700 border border-white/40 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-450 leading-tight truncate max-w-[110px] mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="p-2 rounded-xl border border-white/50 bg-white/40 hover:bg-white/80 hover:border-rose-100 text-slate-400 hover:text-rose-600 transition duration-200 active:scale-95 shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col flex-1 md:pl-64 h-full">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-85 transition">
            <Image src="/logo.png" alt="Vouchr" width={120} height={36} className="h-8 w-auto" />
            <span className={`text-[10px] font-bold border border-white/45 px-2 py-0.5 rounded-full ml-2 ${roleColor}`}>
              {user.role}
            </span>
          </Link>
          
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 border border-white/50 px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/80"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Logout
            </button>
          </form>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1 overflow-y-auto relative focus:outline-none p-6 md:p-10">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
