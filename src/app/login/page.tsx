"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth-actions";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickSelect = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-12 lg:px-8 bg-slate-50">
      {/* Liquid animated blobs in the background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/50 blur-[120px] mix-blend-multiply filter animate-blob-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-200/50 blur-[120px] mix-blend-multiply filter animate-blob-2" />
      <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-sky-200/40 blur-[100px] mix-blend-multiply filter animate-blob-3" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-6 transition-transform duration-300 hover:scale-105">
          <Image src="/logo.png" alt="Vouchr" width={180} height={54} className="h-14 w-auto mx-auto" priority />
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Enterprise Expense Voucher Management Portal
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel px-8 py-10 rounded-2xl">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-50/80 p-4 border border-rose-100/50 text-sm text-rose-700 backdrop-blur-sm shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Work Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-white/40 bg-white/40 px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-indigo-500 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition duration-200"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Password
                </label>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/40 bg-white/40 px-4 py-3 pr-10 text-slate-950 placeholder-slate-400 focus:border-indigo-500 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-650 to-indigo-600 hover:from-indigo-600 hover:to-indigo-550 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-300 disabled:opacity-50 active:scale-[0.98]"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-white/20 pt-6">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-450 mb-4">
              Quick Switch Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect("employee@vouchr.com")}
                className="flex flex-col items-center justify-center rounded-xl border border-white/45 bg-white/20 hover:bg-white/60 py-3 px-2 transition duration-250 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 text-center active:scale-95"
              >
                <span className="text-xs font-bold text-slate-700">Employee</span>
                <span className="text-[9px] font-medium text-slate-450 mt-0.5">Engineering</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("director@vouchr.com")}
                className="flex flex-col items-center justify-center rounded-xl border border-white/45 bg-white/20 hover:bg-white/60 py-3 px-2 transition duration-250 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 text-center active:scale-95"
              >
                <span className="text-xs font-bold text-slate-700">Director</span>
                <span className="text-[9px] font-medium text-slate-450 mt-0.5">Engineering</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("accounts@vouchr.com")}
                className="flex flex-col items-center justify-center rounded-xl border border-white/45 bg-white/20 hover:bg-white/60 py-3 px-2 transition duration-250 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 text-center active:scale-95"
              >
                <span className="text-xs font-bold text-slate-700">Accounts</span>
                <span className="text-[9px] font-medium text-slate-450 mt-0.5">Finance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
