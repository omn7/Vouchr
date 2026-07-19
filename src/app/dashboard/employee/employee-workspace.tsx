"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  createVoucher, 
  updateVoucher, 
  deleteVoucher, 
  submitVoucher 
} from "@/app/actions/voucher-actions";
import {
  saveSignatureAction,
  deleteSignatureAction
} from "@/app/actions/auth-actions";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Send, 
  Eye, 
  X, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText,
  Paperclip,
  Search,
  Check
} from "lucide-react";

// Input Validation Schema using Zod
const voucherFormSchema = z.object({
  department: z.string().min(2, "Department must be at least 2 characters"),
  expenseTitle: z.string().min(3, "Title must be at least 3 characters"),
  expenseCategory: z.string().min(2, "Category is required"),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  amount: z.number().positive("Amount must be a positive number"),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

type VoucherFormValues = z.infer<typeof voucherFormSchema>;

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
}

interface EmployeeWorkspaceProps {
  initialVouchers: Voucher[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    signatureUrl?: string | null;
  };
}

export function EmployeeWorkspace({ initialVouchers, user }: EmployeeWorkspaceProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [submittingVoucher, setSubmittingVoucher] = useState<Voucher | null>(null);
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);
  
  // Search, Filter, Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [signature, setSignature] = useState("");
  const [signatureType, setSignatureType] = useState<"text" | "image">("text");
  const [sigUploading, setSigUploading] = useState(false);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState<string | null>(user.signatureUrl || null);
  const [sigProfileUploading, setSigProfileUploading] = useState(false);
  const [useSavedSignature, setUseSavedSignature] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtered & Sorted Vouchers
  const processedVouchers = vouchers
    .filter((v) => {
      const matchesSearch = 
        v.expenseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "ALL" || v.expenseCategory === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || v.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
      if (sortBy === "date-asc") return new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      department: "Engineering",
      expenseTitle: "",
      expenseCategory: "Travel",
      expenseDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      description: "",
    },
  });

  const openCreateModal = () => {
    setEditingVoucher(null);
    setReceiptUrl(null);
    reset({
      department: "Engineering",
      expenseTitle: "",
      expenseCategory: "Travel",
      expenseDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      description: "",
      receiptUrl: "",
    });
    setActionError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setReceiptUrl(voucher.receiptUrl || null);
    reset({
      department: voucher.department,
      expenseTitle: voucher.expenseTitle,
      expenseCategory: voucher.expenseCategory,
      expenseDate: voucher.expenseDate.slice(0, 10),
      amount: voucher.amount,
      description: voucher.description || "",
      receiptUrl: voucher.receiptUrl || "",
    });
    setActionError(null);
    setIsFormOpen(true);
  };

  const openSubmitModal = (voucher: Voucher) => {
    setSubmittingVoucher(voucher);
    setSignature(savedSignatureUrl || "");
    setUseSavedSignature(!!savedSignatureUrl);
    setSignatureType("text");
    setSigUploading(false);
    setActionError(null);
    setIsSubmitOpen(true);
  };

  const openDetailModal = (voucher: Voucher) => {
    setDetailVoucher(voucher);
    setIsDetailOpen(true);
  };

  const onFormSubmit = (values: VoucherFormValues) => {
    setActionError(null);
    startTransition(async () => {
      let res;
      if (editingVoucher) {
        res = await updateVoucher(editingVoucher.id, values);
      } else {
        res = await createVoucher(values);
      }

      if (res.error) {
        setActionError(res.error);
      } else {
        if (!res.voucher) return;
        const serialized = {
          ...res.voucher,
          expenseDate: new Date(res.voucher.expenseDate).toISOString(),
          createdAt: new Date(res.voucher.createdAt).toISOString(),
          approvalDate: res.voucher.approvalDate ? new Date(res.voucher.approvalDate).toISOString() : null,
        } as Voucher;

        if (editingVoucher) {
          setVouchers(prev =>
            prev.map(v => (v.id === editingVoucher.id ? serialized : v))
          );
        } else {
          setVouchers(prev => [serialized, ...prev]);
        }
        setIsFormOpen(false);
      }
    });
  };

  const handleVoucherDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this draft voucher?")) return;
    setActionError(null);
    startTransition(async () => {
      const res = await deleteVoucher(id);
      if (res.error) {
        alert(res.error);
      } else {
        setVouchers(prev => prev.filter(v => v.id !== id));
      }
    });
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingVoucher) return;
    if (!signature.trim()) {
      setActionError("Your signature name is required.");
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await submitVoucher(submittingVoucher.id, signature);
      if (res.error) {
        setActionError(res.error);
      } else {
        setVouchers(prev =>
          prev.map(v => (v.id === submittingVoucher.id ? { 
            ...v, 
            status: "PENDING", 
            employeeSignature: signature 
          } : v))
        );
        setIsSubmitOpen(false);
      }
    });
  };

  const stats = {
    totalCount: vouchers.length,
    draftCount: vouchers.filter((v) => v.status === "DRAFT").length,
    pendingCount: vouchers.filter((v) => v.status === "PENDING").length,
    approvedCount: vouchers.filter((v) => v.status === "APPROVED").length,
    totalAmount: vouchers.reduce((acc, curr) => acc + curr.amount, 0),
  };

  const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Expense Vouchers</h1>
          <p className="text-sm text-slate-500 mt-1">Create, submit, and track your business expense reimbursements.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Voucher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Claims</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-450 mt-1 block">Accumulated amount</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.approvedCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">Reimbursements ready</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">Awaiting review</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.draftCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">Not yet submitted</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Count</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">All claims created</span>
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
            Upload your signature image once to store it securely in your profile. You can automatically apply it to future submissions.
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

      {/* Vouchers List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/20 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Voucher Ledger</h3>
          <span className="text-xs text-slate-400">Showing {processedVouchers.length} of {vouchers.length} claims</span>
        </div>

        {/* Search, Filter, Sort Control Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, number..."
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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

        <div className="overflow-x-auto">
          {processedVouchers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-sm">No matching vouchers found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Voucher Number</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Receipt</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {processedVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{voucher.voucherNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{voucher.expenseTitle}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{voucher.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(voucher.expenseDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/50">
                        {voucher.expenseCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">${voucher.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[voucher.status]}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {voucher.receiptUrl ? (
                        <a
                          href={voucher.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-bold text-indigo-650 hover:underline bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/50"
                        >
                          <Paperclip className="h-3 w-3 mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openDetailModal(voucher)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {voucher.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => openEditModal(voucher)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
                            title="Edit Draft"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openSubmitModal(voucher)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 hover:text-indigo-800 transition"
                            title="Submit for Approval"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleVoucherDelete(voucher.id)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-rose-100 text-rose-500 bg-rose-50/30 hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Delete Draft"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE & EDIT FORM OVERLAY MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editingVoucher ? "Edit Expense Claim" : "New Expense Claim"}</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {actionError && (
              <div className="m-6 bg-rose-50 border border-rose-100 text-rose-700 text-xs p-4 rounded-lg flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    {...register("department")}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.department && (
                    <p className="text-xs text-rose-600 mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Expense Category
                  </label>
                  <select
                    {...register("expenseCategory")}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Meals">Meals</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Software">Software</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Expense Title / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS Production Infrastructure Hosting"
                  {...register("expenseTitle")}
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.expenseTitle && (
                  <p className="text-xs text-rose-600 mt-1">{errors.expenseTitle.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    {...register("expenseDate")}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.expenseDate && (
                    <p className="text-xs text-rose-600 mt-1">{errors.expenseDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Claim Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount", { valueAsNumber: true })}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.amount && (
                    <p className="text-xs text-rose-600 mt-1">{errors.amount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Detailed Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this expense was incurred..."
                  {...register("description")}
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none animate-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Receipt / Proof of Payment (JPG, PNG, PDF)
                </label>
                <div className="mt-1.5 flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success) {
                          setReceiptUrl(data.url);
                          setValue("receiptUrl", data.url);
                        } else {
                          alert(data.error || "Upload failed");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Failed to upload file");
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className="hidden"
                    id="receipt-file-input"
                  />
                  <label
                    htmlFor="receipt-file-input"
                    className="cursor-pointer inline-flex items-center px-4 py-2.5 rounded-xl border border-white/50 bg-white/20 hover:bg-white/60 text-slate-700 text-sm font-semibold transition shadow-sm active:scale-95"
                  >
                    {uploading ? "Uploading..." : receiptUrl ? "Change Receipt" : "Upload Receipt"}
                  </label>
                  {receiptUrl && (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-650 hover:underline flex items-center bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100"
                    >
                      <Paperclip className="h-3 w-3 mr-1" />
                      View Uploaded
                    </a>
                  )}
                </div>
                <input type="hidden" {...register("receiptUrl")} />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold transition disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingVoucher ? "Save Changes" : "Create Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT SIGNATURE OVERLAY MODAL */}
      {isSubmitOpen && submittingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Sign & Submit Voucher</h3>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs p-4 rounded-lg flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleVoucherSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                By submitting this expense claim of <strong className="text-slate-800">${submittingVoucher.amount.toFixed(2)}</strong>, you attest that the expenses listed are valid business expenses incurred on behalf of the company.
              </p>

              <div className="space-y-4">
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
                      <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-lg flex items-center justify-center h-20">
                        <img src={savedSignatureUrl} alt="Signature preview" className="max-h-full object-contain" />
                      </div>
                    )}
                  </div>
                ) : null}

                {(!savedSignatureUrl || !useSavedSignature) && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Signature Authorization
                    </label>
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
                      <div>
                        <input
                          type="text"
                          required
                          placeholder={user.name}
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-955 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-serif italic text-lg tracking-wider"
                        />
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
                          id="signature-file-input"
                        />
                        <div className="flex items-center space-x-3">
                          <label
                            htmlFor="signature-file-input"
                            className="cursor-pointer inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition shadow-sm active:scale-95"
                          >
                            {sigUploading ? "Uploading..." : signature ? "Change Signature" : "Select Signature Image"}
                          </label>
                          {signature && (
                            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-100">
                              <Check className="h-3.5 w-3.5 animate-none" />
                              <span>Uploaded</span>
                            </div>
                          )}
                        </div>
                        {signature && (
                          <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-lg flex items-center justify-center h-20">
                            <img src={signature} alt="Signature preview" className="max-h-full object-contain" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
 
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || sigUploading || !signature.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold transition disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : "Sign & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {isDetailOpen && detailVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Expense Details</span>
                <h3 className="font-mono text-sm font-bold text-slate-900 mt-0.5">{detailVoucher.voucherNumber}</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{detailVoucher.expenseTitle}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{detailVoucher.department} • {detailVoucher.expenseCategory}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-950">${detailVoucher.amount.toFixed(2)}</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[detailVoucher.status]}`}>
                      {detailVoucher.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Date Incurred</p>
                  <p className="text-slate-800 mt-1 font-medium">
                    {new Date(detailVoucher.expenseDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Logged Date</p>
                  <p className="text-slate-800 mt-1 font-medium">
                    {new Date(detailVoucher.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1.5 leading-relaxed">
                   {detailVoucher.description || "No description provided."}
                </p>
              </div>

              {detailVoucher.receiptUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attached Receipt</p>
                  <div className="mt-1.5">
                    <a
                      href={detailVoucher.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-indigo-650 hover:underline bg-indigo-50/50 px-3 py-2 rounded-xl border border-indigo-100"
                    >
                      <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                      View Uploaded Document ({detailVoucher.receiptUrl.split(".").pop()?.toUpperCase()})
                    </a>
                  </div>
                </div>
              )}

              {detailVoucher.status === "REJECTED" && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-4">
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Rejection Reason</p>
                  <p className="text-xs text-rose-700 mt-1.5 leading-relaxed">{detailVoucher.rejectionReason}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Trail & Signatures</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Employee Signature</p>
                    {detailVoucher.employeeSignature ? (
                      (detailVoucher.employeeSignature.startsWith("/uploads/") || detailVoucher.employeeSignature.startsWith("/api/files/")) ? (
                        <div className="mt-2 h-10 flex items-center justify-start">
                          <img src={detailVoucher.employeeSignature} alt="Employee Signature" className="max-h-full object-contain bg-white border border-slate-100 rounded p-0.5" />
                        </div>
                      ) : (
                        <p className="font-serif italic text-sm text-slate-800 mt-2 tracking-wide font-medium">
                          {detailVoucher.employeeSignature}
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-slate-400 mt-2 italic">Unsigned</p>
                    )}
                    </div>
 
                    <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Director Approval</p>
                      {detailVoucher.status === "APPROVED" && detailVoucher.directorSignature ? (
                        <div>
                          {(detailVoucher.directorSignature.startsWith("/uploads/") || detailVoucher.directorSignature.startsWith("/api/files/")) ? (
                            <div className="mt-2 h-10 flex items-center justify-start">
                              <img src={detailVoucher.directorSignature} alt="Director Signature" className="max-h-full object-contain bg-white border border-slate-100 rounded p-0.5" />
                            </div>
                          ) : (
                            <p className="font-serif italic text-sm text-slate-800 mt-2 tracking-wide font-medium">
                              {detailVoucher.directorSignature}
                            </p>
                          )}
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {detailVoucher.approvalDate ? new Date(detailVoucher.approvalDate).toLocaleDateString() : ""}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2 italic">Awaiting Approval</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
