"use client";

import { useState, useTransition } from "react";
import { approveVoucher, rejectVoucher } from "@/app/actions/voucher-actions";
import { 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText, 
  Slash,
  CornerDownRight,
  Paperclip,
  UserPlus,
  Search,
  Trash2
} from "lucide-react";
import { 
  createEmployeeAction,
  saveSignatureAction,
  deleteSignatureAction
} from "@/app/actions/auth-actions";

interface Voucher {
  id: string;
  voucherNumber: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  department: string;
  expenseTitle: string;
  expenseCategory: string;
  expenseDate: string;
  amount: number;
  description: string | null;
  employeeSignature: string | null;
  directorSignature: string | null;
  approvalDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  receiptUrl?: string | null;
  employee: {
    name: string;
    email: string;
  };
}

interface DirectorWorkspaceProps {
  initialPending: Voucher[];
  initialHistory: Voucher[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    signatureUrl?: string | null;
  };
}

export function DirectorWorkspace({ initialPending, initialHistory, user }: DirectorWorkspaceProps) {
  const [pendingVouchers, setPendingVouchers] = useState<Voucher[]>(initialPending);
  const [historyVouchers, setHistoryVouchers] = useState<Voucher[]>(initialHistory);
  
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  const [signature, setSignature] = useState("");
  const [signatureType, setSignatureType] = useState<"text" | "image">("text");
  const [sigUploading, setSigUploading] = useState(false);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState<string | null>(user.signatureUrl || null);
  const [sigProfileUploading, setSigProfileUploading] = useState(false);
  const [useSavedSignature, setUseSavedSignature] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Add Employee Form States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [employeeActionError, setEmployeeActionError] = useState<string | null>(null);
  const [employeeActionSuccess, setEmployeeActionSuccess] = useState(false);
  const [isEmployeePending, setIsEmployeePending] = useState(false);
  
  // Search, Filter, Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const [isPending, startTransition] = useTransition();

  // Filtered & Sorted Vouchers
  const processedPending = pendingVouchers
    .filter((v) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        v.expenseTitle.toLowerCase().includes(query) ||
        v.voucherNumber.toLowerCase().includes(query) ||
        v.employee.name.toLowerCase().includes(query) ||
        v.employee.email.toLowerCase().includes(query) ||
        (v.description || "").toLowerCase().includes(query);
      
      const matchesCategory = selectedCategory === "ALL" || v.expenseCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
      if (sortBy === "date-asc") return new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  const processedHistory = historyVouchers
    .filter((v) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        v.expenseTitle.toLowerCase().includes(query) ||
        v.voucherNumber.toLowerCase().includes(query) ||
        v.employee.name.toLowerCase().includes(query) ||
        v.employee.email.toLowerCase().includes(query) ||
        (v.description || "").toLowerCase().includes(query);
      
      const matchesCategory = selectedCategory === "ALL" || v.expenseCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
      if (sortBy === "date-asc") return new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  const openReviewModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setSignature(savedSignatureUrl || "");
    setUseSavedSignature(!!savedSignatureUrl);
    setSignatureType("text");
    setSigUploading(false);
    setRejectionReason("");
    setActionError(null);
    setIsReviewOpen(true);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    if (!signature.trim()) {
      setActionError("Your approval signature name is required.");
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await approveVoucher(selectedVoucher.id, signature);
      if (res.error) {
        setActionError(res.error);
      } else {
        const approvedItem: Voucher = {
          ...selectedVoucher,
          status: "APPROVED",
          directorSignature: signature,
          approvalDate: new Date().toISOString(),
          rejectionReason: null,
        };
        // Update state
        setPendingVouchers(prev => prev.filter(v => v.id !== selectedVoucher.id));
        setHistoryVouchers(prev => [approvedItem, ...prev]);
        setIsReviewOpen(false);
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    if (!rejectionReason.trim()) {
      setActionError("Rejection reason is required to reject a claim.");
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await rejectVoucher(selectedVoucher.id, rejectionReason);
      if (res.error) {
        setActionError(res.error);
      } else {
        const rejectedItem: Voucher = {
          ...selectedVoucher,
          status: "REJECTED",
          rejectionReason: rejectionReason,
          directorSignature: null,
          approvalDate: null,
        };
        // Update state
        setPendingVouchers(prev => prev.filter(v => v.id !== selectedVoucher.id));
        setHistoryVouchers(prev => [rejectedItem, ...prev]);
        setIsReviewOpen(false);
      }
    });
  };

  // Stats
  const pendingCount = pendingVouchers.length;
  const approvedCount = historyVouchers.filter(v => v.status === "APPROVED").length;
  const rejectedCount = historyVouchers.filter(v => v.status === "REJECTED").length;
  const totalReviewed = historyVouchers.length;

  const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Director Approval Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Review pending reimbursement claims and audit decision histories.</p>
        </div>
        <button
          onClick={() => setIsEmployeeModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-650 to-indigo-600 hover:from-indigo-600 hover:to-indigo-550 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition duration-200 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">Requires director signature</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{approvedCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">Sent to Finance/Accounts</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
            <X className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{rejectedCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">Returned to employees</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Actions</span>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalReviewed}</p>
          <span className="text-[10px] text-slate-455 mt-1 block">Completed reviews</span>
        </div>
      </div>

      {/* Signature Profile Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center">
            <span className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg mr-2 inline-flex">
              <Check className="h-4 w-4" />
            </span>
            Signature Profile Settings
          </h2>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Upload your director signature image once to store it securely in your profile. You can automatically apply it to future voucher approvals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {savedSignatureUrl ? (
            <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
              <div className="h-10 w-24 bg-white border border-slate-100 rounded flex items-center justify-center p-1">
                <img src={savedSignatureUrl} alt="Saved Signature" className="max-h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">Profile Signature Active</span>
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete your saved signature profile?")) return;
                    try {
                      const res = await deleteSignatureAction();
                      if (res.success) {
                        setSavedSignatureUrl(null);
                      } else {
                        alert(res.error || "Failed to delete signature");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Error deleting signature");
                    }
                  }}
                  className="text-xs font-semibold text-rose-650 hover:underline flex items-center mt-0.5"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Profile Signature
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSigProfileUploading(true);
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.success) {
                      const saveRes = await saveSignatureAction(data.url);
                      if (saveRes.success) {
                        setSavedSignatureUrl(data.url);
                      } else {
                        alert(saveRes.error || "Failed to save signature");
                      }
                    } else {
                      alert(data.error || "Upload failed");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Failed to upload signature image");
                  } finally {
                    setSigProfileUploading(false);
                  }
                }}
                className="hidden"
                id="signature-profile-file-input"
              />
              <label
                htmlFor="signature-profile-file-input"
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-sm active:scale-95 text-center"
              >
                {sigProfileUploading ? "Saving Signature..." : "Upload Profile Signature"}
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 space-x-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === "pending"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Review Queue ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === "history"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Audit History ({totalReviewed})
          </button>
        </div>

        {/* Search, Filter, Sort Control Bar */}
        <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Travel">Travel</option>
              <option value="Meals">Meals</option>
              <option value="Equipment">Equipment</option>
              <option value="Utilities">Utilities</option>
              <option value="Software">Software</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (Highest)</option>
              <option value="amount-asc">Amount (Lowest)</option>
            </select>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "pending" ? (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {processedPending.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  {pendingVouchers.length === 0 ? (
                    <>
                      <CheckCircle className="h-10 w-10 mx-auto text-emerald-300 mb-3" />
                      <p className="font-semibold text-sm text-slate-700">Inbox Zero!</p>
                      <p className="text-xs text-slate-400 mt-1">There are no pending expense claims awaiting your review.</p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-sm text-slate-700">No matching vouchers found</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing your search query or category filter.</p>
                    </>
                  )}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3.5">Employee</th>
                      <th className="px-6 py-3.5">Expense Details</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {processedPending.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{voucher.employee.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{voucher.employee.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{voucher.expenseTitle}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{voucher.department} • {voucher.expenseCategory}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(voucher.expenseDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">${voucher.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openReviewModal(voucher)}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-100 transition"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {processedHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  {historyVouchers.length === 0 ? (
                    <>
                      <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-sm">No historical logs found</p>
                      <p className="text-xs text-slate-400 mt-1">Actions you take on pending vouchers will appear here.</p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-sm text-slate-700">No matching history found</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing your search query or category filter.</p>
                    </>
                  )}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3.5">Voucher</th>
                      <th className="px-6 py-3.5">Employee</th>
                      <th className="px-6 py-3.5">Title</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Audit Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {processedHistory.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{voucher.voucherNumber}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{voucher.employee.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{voucher.employee.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{voucher.expenseTitle}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{voucher.department} • {voucher.expenseCategory}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">${voucher.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[voucher.status]}`}>
                            {voucher.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                          {voucher.status === "APPROVED" ? (
                            <span className="flex items-center">
                              <Check className="h-3 w-3 text-emerald-500 mr-1" />
                              {voucher.directorSignature?.startsWith("/uploads/") ? (
                                "Signed off (Image)"
                              ) : (
                                `Signed by ${voucher.directorSignature}`
                              )}
                            </span>
                          ) : (
                            <span className="flex items-start">
                              <AlertCircle className="h-3 w-3 text-rose-500 mr-1 mt-0.5" />
                              <span className="truncate">{voucher.rejectionReason}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* REVIEW & SIGN/REJECT MODAL */}
      {isReviewOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Pending Review</span>
                <h3 className="font-mono text-sm font-bold text-slate-900 mt-0.5">{selectedVoucher.voucherNumber}</h3>
              </div>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Core Details */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedVoucher.expenseTitle}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitted by {selectedVoucher.employee.name} ({selectedVoucher.employee.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-950">${selectedVoucher.amount.toFixed(2)}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedVoucher.department} • {selectedVoucher.expenseCategory}</p>
                </div>
              </div>

              {/* Sub Dates */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Date Incurred</p>
                  <p className="text-slate-800 mt-1 font-medium">
                    {new Date(selectedVoucher.expenseDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Date Submitted</p>
                  <p className="text-slate-800 mt-1 font-medium">
                    {new Date(selectedVoucher.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1.5 leading-relaxed">
                  {selectedVoucher.description || "No description provided."}
                </p>
              </div>

              {selectedVoucher.receiptUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attached Receipt</p>
                  <div className="mt-1.5 flex items-center space-x-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <a
                      href={selectedVoucher.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-indigo-650 hover:underline bg-white px-3 py-2 rounded-xl border border-white/80 shadow-sm"
                    >
                      <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                      View Document ({selectedVoucher.receiptUrl.split(".").pop()?.toUpperCase()})
                    </a>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700">Uploaded by Claimant:</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{selectedVoucher.employee.name} ({selectedVoucher.employee.email})</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee Signature */}
              <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Employee Signature Verified</p>
                {selectedVoucher.employeeSignature ? (
                  selectedVoucher.employeeSignature.startsWith("/uploads/") ? (
                    <div className="mt-2 h-10 flex items-center justify-start">
                      <img src={selectedVoucher.employeeSignature} alt="Employee Signature" className="max-h-full object-contain bg-white border border-slate-100 rounded p-0.5" />
                    </div>
                  ) : (
                    <p className="font-serif italic text-sm text-slate-800 mt-2 tracking-wide font-medium flex items-center">
                      <CornerDownRight className="h-3 w-3 text-indigo-500 mr-1.5" />
                      {selectedVoucher.employeeSignature}
                    </p>
                  )
                ) : (
                  <p className="text-xs text-slate-400 mt-2 italic">Unsigned</p>
                )}
              </div>

              {actionError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
 
              {/* ACTION FORMS */}
              <div className="border-t border-slate-100 pt-5 space-y-6">
                {/* Approve Form */}
                <form onSubmit={handleApprove} className="space-y-4">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Sign off & Approve Reimbursement
                  </label>
 
                  {savedSignatureUrl ? (
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                        <input
                          type="checkbox"
                          checked={useSavedSignature}
                          onChange={(e) => {
                            setUseSavedSignature(e.target.checked);
                            if (e.target.checked) {
                              setSignature(savedSignatureUrl);
                              setRejectionReason(""); // clear other action input
                            } else {
                              setSignature("");
                            }
                          }}
                          className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-905 block">Use Stored Profile Signature</span>
                          <span className="text-[10px] text-slate-450 block mt-0.5">Apply your saved signature image automatically</span>
                        </div>
                      </label>
 
                      {useSavedSignature && (
                        <div className="flex items-center justify-between">
                          <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-lg flex items-center justify-center h-20 w-1/2">
                            <img src={savedSignatureUrl} alt="Signature preview" className="max-h-full object-contain" />
                          </div>
                          <button
                            type="submit"
                            disabled={isPending || !signature.trim()}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
 
                  {(!savedSignatureUrl || !useSavedSignature) && (
                    <div className="space-y-4">
                      {/* Tabs */}
                      <div className="flex bg-slate-100 p-1 rounded-lg w-full space-x-1 border border-slate-200/50">
                        <button
                          type="button"
                          onClick={() => {
                            setSignatureType("text");
                            setSignature("");
                          }}
                          className={`flex-1 text-center py-1.5 rounded-md text-xs font-semibold tracking-wide transition ${
                            signatureType === "text"
                              ? "bg-white text-slate-950 shadow-xs border-slate-200"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Type Signature
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSignatureType("image");
                            setSignature("");
                          }}
                          className={`flex-1 text-center py-1.5 rounded-md text-xs font-semibold tracking-wide transition ${
                            signatureType === "image"
                              ? "bg-white text-slate-950 shadow-xs border-slate-200"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Upload Image
                        </button>
                      </div>
 
                      {signatureType === "text" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write your Full Name to approve"
                            value={signature}
                            onChange={(e) => {
                              setSignature(e.target.value);
                              setRejectionReason(""); // clear other action input
                            }}
                            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-955 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-serif italic text-base tracking-wider"
                          />
                          <button
                            type="submit"
                            disabled={isPending || !signature.trim()}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setSigUploading(true);
                              setActionError(null);
                              const formData = new FormData();
                              formData.append("file", file);
                              try {
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setSignature(data.url);
                                  setRejectionReason(""); // clear other action input
                                } else {
                                  setActionError(data.error || "Upload failed");
                                }
                              } catch (err) {
                                console.error(err);
                                setActionError("Failed to upload signature image");
                              } finally {
                                setSigUploading(false);
                              }
                            }}
                            className="hidden"
                            id="director-signature-file-input"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <label
                                htmlFor="director-signature-file-input"
                                className="cursor-pointer inline-flex items-center px-4 py-2 text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold transition shadow-sm active:scale-95"
                              >
                                {sigUploading ? "Uploading..." : signature ? "Change Signature" : "Select Signature Image"}
                              </label>
                              {signature && (
                                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded-md border border-emerald-100">
                                  <Check className="h-3 w-3" />
                                  <span>Uploaded</span>
                                </div>
                              )}
                            </div>
                            <button
                              type="submit"
                              disabled={isPending || sigUploading || !signature.trim()}
                              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                          </div>
                          {signature && (
                            <div className="border border-slate-150 bg-slate-50/50 p-3 rounded-lg flex items-center justify-center h-20">
                              <img src={signature} alt="Signature preview" className="max-h-full object-contain" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">or</span>
                  </div>
                </div>

                {/* Reject Form */}
                <form onSubmit={handleReject} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Reject Voucher (Requires Reason)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Receipt is missing or amount is incorrect"
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        setSignature(""); // clear other action input
                      }}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isPending || !rejectionReason.trim()}
                      className="inline-flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Account Provisioning</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">Register New Employee</h3>
              </div>
              <button
                onClick={() => {
                  setIsEmployeeModalOpen(false);
                  setEmployeeActionError(null);
                  setEmployeeActionSuccess(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEmployeeActionError(null);
                setEmployeeActionSuccess(false);
                setIsEmployeePending(true);

                try {
                  const res = await createEmployeeAction({
                    name: newName,
                    email: newEmail,
                    passwordSecret: newPassword,
                  });

                  if (res.error) {
                    setEmployeeActionError(res.error);
                  } else {
                    setEmployeeActionSuccess(true);
                    setNewName("");
                    setNewEmail("");
                    setNewPassword("");
                    setTimeout(() => {
                      setIsEmployeeModalOpen(false);
                      setEmployeeActionSuccess(false);
                    }, 1500);
                  }
                } catch (err: any) {
                  setEmployeeActionError(err.message || "An unexpected error occurred.");
                } finally {
                  setIsEmployeePending(false);
                }
              }}
              className="p-6 space-y-4"
            >
              {employeeActionError && (
                <div className="rounded-xl bg-rose-50 p-4 border border-rose-100/50 text-xs text-rose-700 font-medium animate-in fade-in slide-in-from-top-1">
                  {employeeActionError}
                </div>
              )}

              {employeeActionSuccess && (
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100/50 text-xs text-emerald-700 font-bold animate-in fade-in slide-in-from-top-1">
                  Employee successfully registered! Closing...
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmployeeModalOpen(false);
                    setEmployeeActionError(null);
                    setEmployeeActionSuccess(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEmployeePending}
                  className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-semibold transition shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isEmployeePending ? "Registering..." : "Register Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
