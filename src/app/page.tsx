"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Building,
  CreditCard,
  Check,
  X,
  FileCheck,
  Download,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop
} from "lucide-react";

export default function Home() {
  const [mockStatus, setMockStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [directorSignature, setDirectorSignature] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = () => {
    setMockStatus("APPROVED");
    setDirectorSignature("Sarah Director");
    setRejectionReason("");
    setShowRejectInput(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setShowRejectInput(true);
      return;
    }
    setMockStatus("REJECTED");
    setDirectorSignature("");
    setShowRejectInput(false);
  };

  const handleResetMock = () => {
    setMockStatus("PENDING");
    setDirectorSignature("");
    setRejectionReason("");
    setShowRejectInput(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-slate-50">
      {/* Dynamic Ambient Background Blobs — contained so they don't extend page height */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-tr from-indigo-200/40 to-indigo-300/20 blur-3xl animate-blob-1" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-sky-200/40 to-purple-200/20 blur-3xl animate-blob-2" />
        <div className="absolute top-[35%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-violet-200/30 to-pink-200/10 blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/40 bg-white/75 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition group">
            <Image src="/logo.png" alt="Vouchr" width={200} height={60} className="h-14 w-auto group-hover:scale-105 transition-transform duration-200" priority />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#demo-walkthrough" className="hover:text-indigo-600 transition">Demo Workspaces</a>
            <a href="#tech-stack" className="hover:text-indigo-600 transition">Tech Stack</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 px-4.5 py-2.5 rounded-xl shadow-md shadow-indigo-150 hover:shadow-lg hover:shadow-indigo-200 transition duration-200 active:scale-95"
            >
              Access Demo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-16">
        <section className="relative overflow-hidden">
          {/* Modern gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.08),transparent_70%)]" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M60 0H0v60\' fill=\'none\' stroke=\'%23334155\' stroke-width=\'.5\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />

          <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-0 lg:pt-28 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/70 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <span>Enterprise Expense Voucher Platform</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-none">
                  Reimbursements, <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                    Audited Instantly.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  Vouchr is a role-based expense compliance dashboard. Empower employees to draft claims with receipt validation, enable directors to check and authorize uploads, and equip audit teams with real-time ledgers.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 px-8 py-4 transition duration-200 active:scale-95"
                  >
                    Launch Demo Portals
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                  <a
                    href="#demo-walkthrough"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-white hover:shadow-md px-8 py-4 text-sm transition duration-200 active:scale-95"
                  >
                    Role Switcher Guide
                  </a>
                </div>

              {/* Stats / Highlights Grid */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-900">3 Roles</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pre-configured</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-950">Secure</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JWT Session</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-900">Auto-Sign</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Saved</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Audit Simulator */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg glass-panel rounded-3xl border border-slate-250/50 shadow-2xl overflow-hidden bg-white/90 transition-transform duration-300 hover:scale-[1.01]">
                {/* Simulator Tab Bar */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex space-x-1.5">
                      <span className="h-3 w-3 rounded-full bg-rose-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-405 ml-2 uppercase font-mono">Interactive Compliance Simulator</span>
                  </div>
                  {mockStatus !== "PENDING" && (
                    <button
                      onClick={handleResetMock}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1 rounded-lg transition"
                    >
                      Reset State
                    </button>
                  )}
                </div>

                {/* Simulator Content */}
                <div className="p-6 space-y-6">
                  {/* Voucher Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest block">Claim: VOU-2026-7073</span>
                      <h4 className="text-lg font-bold text-slate-905 leading-none">Aeroplane Boarding Cost</h4>
                      <p className="text-xs text-slate-500 font-medium">Claimant: Om Narkhede (Engineering)</p>
                    </div>
                    <div className="text-right space-y-1.5">
                      <span className="text-2xl font-black text-slate-950">$340.50</span>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition duration-300 ${
                            mockStatus === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-250 animate-pulse"
                              : mockStatus === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                              : "bg-rose-50 text-rose-800 border-rose-250"
                          }`}
                        >
                          {mockStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simulator Status Box */}
                  {mockStatus === "APPROVED" ? (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4.5 flex items-start animate-in zoom-in-95 duration-200">
                      <div className="flex-shrink-0 bg-emerald-500 rounded-full p-1 text-white">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="ml-3.5 text-left space-y-1">
                        <h5 className="text-xs font-bold text-emerald-900">Compliance Audit: Passed</h5>
                        <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                          The expensed claim contains validated claimant and authorizing director signatures. Ready for Accounts payout.
                        </p>
                      </div>
                    </div>
                  ) : mockStatus === "REJECTED" ? (
                    <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4.5 flex items-start animate-in zoom-in-95 duration-200">
                      <div className="flex-shrink-0 bg-rose-550 rounded-full p-1 text-white animate-bounce">
                        <X className="h-4 w-4" />
                      </div>
                      <div className="ml-3.5 text-left space-y-1">
                        <h5 className="text-xs font-bold text-rose-900">Compliance Audit: Flagged / Rejected</h5>
                        <p className="text-xs text-rose-700 leading-relaxed font-medium">
                          Reason: <strong className="text-rose-900 font-bold">{rejectionReason || "Claim fails policy guidelines."}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4.5 flex items-start">
                      <div className="flex-shrink-0 text-indigo-500 mt-0.5 animate-spin-slow">
                        <Clock className="h-4.5 w-4.5" />
                      </div>
                      <div className="ml-3.5 text-left space-y-1">
                        <h5 className="text-xs font-bold text-indigo-900">Audit Status: Awaiting Approval</h5>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                          Claimant submitted receipt bill document. Make a review decision below to simulate compliance audit tracking.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Signatures Verified Panel */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left space-y-1 shadow-2xs">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Employee Signature</p>
                      <p className="font-serif italic text-sm text-slate-750 font-medium">Om Narkhede</p>
                      <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wide">SIGNED</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left relative overflow-hidden shadow-2xs">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Director Signature</p>
                      {directorSignature ? (
                        <div className="space-y-1">
                          <p className="font-serif italic text-sm text-slate-750 font-medium animate-in slide-in-from-bottom-2 duration-300">{directorSignature}</p>
                          <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wide">VERIFIED</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-400 mt-2 italic font-semibold animate-pulse">Awaiting signature...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decisions Drawer */}
                  {mockStatus === "PENDING" && (
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      {showRejectInput ? (
                        <div className="space-y-3.5 animate-in fade-in duration-200 text-left">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Define Reason for Rejection
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Flight invoice not provided"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setShowRejectInput(false)}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-605 transition active:scale-95"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleReject}
                              disabled={!rejectionReason.trim()}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-550 text-white text-[11px] font-bold transition shadow-md shadow-rose-100 disabled:opacity-50 active:scale-95"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3.5 justify-end">
                          <button
                            onClick={() => setShowRejectInput(true)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition shadow-2xs active:scale-95"
                          >
                            <X className="h-4 w-4 mr-2 text-rose-500" />
                            Reject...
                          </button>
                          <button
                            onClick={handleApprove}
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold transition shadow-md shadow-emerald-200 active:scale-95"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Sign & Approve
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
           </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="bg-white border-y border-slate-200/50 py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Complete Compliance Workflow</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Every step covered, from creation to payout.
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                Vouchr streamlines audit paths by dividing operations into clear role-based workspaces. All data changes sync to database states in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {/* Feature 1 */}
              <div className="p-7 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 transition group text-left space-y-5">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                  <User className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base">1. File & Sign (Claimants)</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Employees create voucher claims, assign categories, and attach proof bills. Submit automatically using a saved profile signature or upload custom images.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 transition group text-left space-y-5">
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-650 flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base">2. Review & Authorize (Approvers)</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Directors oversee pending queues. Review proof receipt images, verify employee's digital signature, and finalize decisions with automated signature stamp application.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 transition group text-left space-y-5">
                <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-655 flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base">3. Ledger Audit & Export (Auditors)</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Finance officers query audit trails in a global ledger. Perform query searches, sort data, isolate min/max amount ranges, and download CSV spreadsheet reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Switcher Section */}
        <section id="demo-walkthrough" className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Workspace Switcher</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Ready to try? Select a demo workspace.
              </h2>
              <p className="text-slate-555 text-sm sm:text-base leading-relaxed font-medium">
                Switch workspaces instantly to inspect individual dashboards and operations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
              {/* Employee Role Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm flex flex-col justify-between text-left hover:shadow-md transition duration-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-3xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Employee
                    </span>
                    <span className="text-xs text-slate-400 font-bold">employee@vouchr.com</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Claimant Workspace</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Manage drafts, upload receipt images, toggle signature settings, and submit.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-slate-55 text-slate-700 hover:bg-indigo-600 hover:text-white border border-slate-200 font-bold text-xs transition duration-200 active:scale-95"
                >
                  Enter Employee Portal
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>

              {/* Director Role Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm flex flex-col justify-between text-left hover:shadow-md transition duration-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-3xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-violet-50 text-violet-750 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Director
                    </span>
                    <span className="text-xs text-slate-400 font-bold">director@vouchr.com</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Manager Dashboard</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Inspect pending queues, stamp director signatures, and reject with compliance feedback.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-slate-55 text-slate-700 hover:bg-indigo-600 hover:text-white border border-slate-200 font-bold text-xs transition duration-200 active:scale-95"
                >
                  Enter Director Portal
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>

              {/* Accounts Role Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm flex flex-col justify-between text-left hover:shadow-md transition duration-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-sky-50 to-transparent rounded-bl-3xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Auditor
                    </span>
                    <span className="text-xs text-slate-400 font-bold">accounts@vouchr.com</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Financial Ledger</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Query digital trail logs, inspect certificates, filter ranges, and export CSVs.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-slate-55 text-slate-700 hover:bg-indigo-600 hover:text-white border border-slate-200 font-bold text-xs transition duration-200 active:scale-95"
                >
                  Enter Accounts Portal
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack section */}
        <section id="tech-stack" className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-12">
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Stack Architecture</span>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Built with reliable modern foundations.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-2xl shadow-xs">
                <Laptop className="h-8 w-8 text-indigo-400 mb-4" />
                <h4 className="font-bold text-sm">Next.js App Router</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Server Actions</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-2xl shadow-xs">
                <Database className="h-8 w-8 text-indigo-400 mb-4" />
                <h4 className="font-bold text-sm">Prisma ORM</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">PostgreSQL Model</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-2xl shadow-xs">
                <Lock className="h-8 w-8 text-indigo-400 mb-4" />
                <h4 className="font-bold text-sm">Jose JWT Security</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">HttpOnly Cookie</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-2xl shadow-xs">
                <FileText className="h-8 w-8 text-indigo-400 mb-4" />
                <h4 className="font-bold text-sm">Static Assets</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Local Uploads</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 text-slate-400 text-xs py-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center hover:opacity-90 transition">
            <Image src="/logo.png" alt="Vouchr" width={120} height={36} className="h-7 w-auto brightness-0 invert" />
          </Link>
          <p className="font-medium text-slate-500">© {new Date().getFullYear()} Vouchr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
