"use client";

import { useState } from "react";
import { 
  Eye, 
  X, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CreditCard,
  Building,
  Check,
  Award,
  Paperclip,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Trash2
} from "lucide-react";

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

interface AccountsWorkspaceProps {
  initialVouchers: Voucher[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function AccountsWorkspace({ initialVouchers, user }: AccountsWorkspaceProps) {
  const [vouchers] = useState<Voucher[]>(initialVouchers);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "APPROVED" | "PENDING" | "REJECTED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("DATE_DESC");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Dynamically get unique departments from initialVouchers
  const uniqueDepartments = Array.from(
    new Set(initialVouchers.map((v) => v.department).filter(Boolean))
  ).sort();

  // Filter and sort vouchers based on all selected parameters
  const filteredVouchers = vouchers
    .filter((v) => {
      // 1. Status Filter
      if (filterStatus === "ALL") {
        if (v.status === "DRAFT") return false; // Accounts only views submitted items
      } else {
        if (v.status !== filterStatus) return false;
      }

      // 2. Search Term Filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          v.voucherNumber.toLowerCase().includes(query) ||
          v.employee.name.toLowerCase().includes(query) ||
          v.employee.email.toLowerCase().includes(query) ||
          v.expenseTitle.toLowerCase().includes(query) ||
          (v.description && v.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== "ALL" && v.expenseCategory !== selectedCategory) {
        return false;
      }

      // 4. Department Filter
      if (selectedDepartment !== "ALL" && v.department !== selectedDepartment) {
        return false;
      }

      // 5. Min Amount Filter
      if (minAmount !== "") {
        const min = parseFloat(minAmount);
        if (!isNaN(min) && v.amount < min) return false;
      }

      // 6. Max Amount Filter
      if (maxAmount !== "") {
        const max = parseFloat(maxAmount);
        if (!isNaN(max) && v.amount > max) return false;
      }

      // 7. Start Date Filter
      if (startDate !== "") {
        const start = new Date(startDate);
        const expenseDate = new Date(v.expenseDate);
        if (expenseDate < start) return false;
      }

      // 8. End Date Filter
      if (endDate !== "") {
        const end = new Date(endDate);
        const expenseDate = new Date(v.expenseDate);
        if (expenseDate > end) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "DATE_ASC":
          return new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
        case "DATE_DESC":
          return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
        case "AMOUNT_ASC":
          return a.amount - b.amount;
        case "AMOUNT_DESC":
          return b.amount - a.amount;
        case "NAME_ASC":
          return a.employee.name.localeCompare(b.employee.name);
        case "NAME_DESC":
          return b.employee.name.localeCompare(a.employee.name);
        case "VOUCHER_ASC":
          return a.voucherNumber.localeCompare(b.voucherNumber);
        case "VOUCHER_DESC":
          return b.voucherNumber.localeCompare(a.voucherNumber);
        default:
          return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
      }
    });

  const isAnyFilterActive =
    searchTerm !== "" ||
    selectedCategory !== "ALL" ||
    selectedDepartment !== "ALL" ||
    minAmount !== "" ||
    maxAmount !== "" ||
    startDate !== "" ||
    endDate !== "";

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedDepartment("ALL");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
  };

  const openDetailModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDetailOpen(true);
  };

  // CSV Exporter
  const exportToCSV = () => {
    const headers = [
      "Voucher Number",
      "Employee Name",
      "Employee Email",
      "Department",
      "Title",
      "Category",
      "Date",
      "Amount",
      "Status",
      "Employee Signature",
      "Director Signature",
      "Approval Date",
      "Rejection Reason",
    ];

    const rows = vouchers
      .filter((v) => v.status !== "DRAFT")
      .map((v) => [
        v.voucherNumber,
        v.employee.name,
        v.employee.email,
        v.department,
        v.expenseTitle,
        v.expenseCategory,
        new Date(v.expenseDate).toLocaleDateString(),
        v.amount,
        v.status,
        v.employeeSignature || "",
        v.directorSignature || "",
        v.approvalDate ? new Date(v.approvalDate).toLocaleDateString() : "",
        v.rejectionReason || "",
      ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vouchr_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const stats = {
    approvedSum: vouchers.filter((v) => v.status === "APPROVED").reduce((acc, c) => acc + c.amount, 0),
    approvedCount: vouchers.filter((v) => v.status === "APPROVED").length,
    pendingCount: vouchers.filter((v) => v.status === "PENDING").length,
    rejectedCount: vouchers.filter((v) => v.status === "REJECTED").length,
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Audit verified expense claims, manage payouts, and export ledgers.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <Download className="h-4 w-4 mr-2 text-slate-500" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ready for Payout</span>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ${stats.approvedSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-450 mt-1 block">{stats.approvedCount} approved claims</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingCount}</p>
          <span className="text-[10px] text-slate-450 mt-1 block">In director queue</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Rejected Claims</span>
            <X className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.rejectedCount}</p>
          <span className="text-[10px] text-slate-455 mt-1 block">Not eligible for payout</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ledger Size</span>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {vouchers.filter((v) => v.status !== "DRAFT").length}
          </p>
          <span className="text-[10px] text-slate-450 mt-1 block">Submitted claims</span>
        </div>
      </div>

      {/* Ledger Filter & Table */}
      <div className="space-y-4">
        {/* Status Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit space-x-1 border border-slate-200/50">
          {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition ${
                filterStatus === status
                  ? "bg-white text-slate-950 shadow-xs border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {status === "ALL" ? "All Submitted" : status}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl space-y-4 shadow-xs border border-slate-200/60 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee, voucher number, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex gap-4 lg:items-center">
              {/* Quick Category Select */}
              <div className="w-full lg:w-44">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Software">Software</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Quick Department Select */}
              <div className="w-full lg:w-44">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="ALL">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Select */}
              <div className="w-full lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="DATE_DESC">Date: Newest First</option>
                  <option value="DATE_ASC">Date: Oldest First</option>
                  <option value="AMOUNT_DESC">Amount: High to Low</option>
                  <option value="AMOUNT_ASC">Amount: Low to High</option>
                  <option value="NAME_ASC">Employee: A to Z</option>
                  <option value="NAME_DESC">Employee: Z to A</option>
                  <option value="VOUCHER_ASC">Voucher No: A to Z</option>
                  <option value="VOUCHER_DESC">Voucher No: Z to A</option>
                </select>
              </div>
            </div>

            {/* Advanced Toggle & Clear */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition shadow-xs ${
                  isAdvancedOpen
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </button>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm font-semibold hover:bg-rose-100 transition shadow-xs"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel (Collapsible) */}
          {isAdvancedOpen && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-150">
              {/* Amount Min */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Min Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Amount Max */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Max Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          )}

          {/* Results Summary Counter */}
          <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100/50 pt-3">
            <span>
              Showing {filteredVouchers.length} of {vouchers.filter((v) => v.status !== "DRAFT").length} submitted claims
            </span>
            {isAnyFilterActive && (
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                Filters Active
              </span>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            {filteredVouchers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-sm">No vouchers matching this status</p>
                <p className="text-xs text-slate-400 mt-1">Submitted vouchers will show up here for auditing.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Voucher Number</th>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Expense details</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{voucher.voucherNumber}</td>
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
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[voucher.status]}`}>
                          {voucher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailModal(voucher)}
                          className="inline-flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* AUDIT SHEET MODAL */}
      {isDetailOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Audit Inspection Panel</span>
                <h3 className="font-mono text-sm font-bold text-slate-900 mt-0.5">{selectedVoucher.voucherNumber}</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Status Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedVoucher.expenseTitle}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Claimant: {selectedVoucher.employee.name} ({selectedVoucher.employee.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-950">${selectedVoucher.amount.toFixed(2)}</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[selectedVoucher.status]}`}>
                      {selectedVoucher.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Signoff Banner for Approved items */}
              {selectedVoucher.status === "APPROVED" && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500 rounded-full p-1 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                  <div className="ml-3">
                    <h5 className="text-xs font-bold text-emerald-800">Compliance Audit: Approved for Payout</h5>
                    <p className="text-xs text-emerald-700 mt-1">
                      This claim has been signed off by the employee and authorized by the department director. Payout is compliant.
                    </p>
                  </div>
                </div>
              )}

              {selectedVoucher.status === "REJECTED" && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex items-start">
                  <div className="flex-shrink-0 bg-rose-500 rounded-full p-1 text-white">
                    <X className="h-3 w-3" />
                  </div>
                  <div className="ml-3">
                    <h5 className="text-xs font-bold text-rose-800">Compliance Audit: Claim Rejected</h5>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                      Reason: {selectedVoucher.rejectionReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Claim Metrics */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-lg text-xs">
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                  <p className="text-slate-800 mt-1 font-semibold flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    {selectedVoucher.department}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-slate-800 mt-1 font-semibold">{selectedVoucher.expenseCategory}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Date Incurred</p>
                  <p className="text-slate-800 mt-1 font-semibold">
                    {new Date(selectedVoucher.expenseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Purpose Description</p>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                  {selectedVoucher.description || "No description provided."}
                </p>
              </div>

              {selectedVoucher.receiptUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Documentation (Receipt)</p>
                  <div className="mt-1.5 flex items-center space-x-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <a
                      href={selectedVoucher.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-indigo-650 hover:underline bg-white px-3 py-2 rounded-xl border border-white/80 shadow-sm"
                    >
                      <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                      View Bill ({selectedVoucher.receiptUrl.split(".").pop()?.toUpperCase()})
                    </a>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700">Uploaded by Claimant:</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{selectedVoucher.employee.name} ({selectedVoucher.employee.email})</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Signatures</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Employee Signature</p>
                    {selectedVoucher.employeeSignature ? (
                      (selectedVoucher.employeeSignature.startsWith("/uploads/") || selectedVoucher.employeeSignature.startsWith("/api/files/")) ? (
                        <div className="mt-2 h-10 flex items-center justify-start">
                          <img src={selectedVoucher.employeeSignature} alt="Employee Signature" className="max-h-full object-contain bg-white border border-slate-100 rounded p-0.5" />
                        </div>
                      ) : (
                        <p className="font-serif italic text-sm text-slate-800 mt-2 tracking-wide font-medium">
                          {selectedVoucher.employeeSignature}
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-slate-400 mt-2 italic">Unsigned</p>
                    )}
                    <span className="text-[9px] text-slate-400 block mt-1">
                      Submitted on {new Date(selectedVoucher.createdAt).toLocaleDateString()}
                    </span>
                  </div>
 
                  <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Director Signature</p>
                    {selectedVoucher.directorSignature ? (
                      <div>
                        {(selectedVoucher.directorSignature.startsWith("/uploads/") || selectedVoucher.directorSignature.startsWith("/api/files/")) ? (
                          <div className="mt-2 h-10 flex items-center justify-start">
                            <img src={selectedVoucher.directorSignature} alt="Director Signature" className="max-h-full object-contain bg-white border border-slate-100 rounded p-0.5" />
                          </div>
                        ) : (
                          <p className="font-serif italic text-sm text-slate-800 mt-2 tracking-wide font-medium">
                            {selectedVoucher.directorSignature}
                          </p>
                        )}
                        <span className="text-[9px] text-slate-400 block mt-1">
                          Approved on {selectedVoucher.approvalDate ? new Date(selectedVoucher.approvalDate).toLocaleDateString() : ""}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2.5 italic">Not Approved</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                {selectedVoucher.status === "APPROVED" ? (
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    Audit Compliant
                  </span>
                ) : (
                  <div></div>
                )}
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
