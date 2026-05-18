import { useState } from "react";
import { useListFees, useListStudents } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  CreditCard, Search, Plus, Edit2, Receipt, CheckCircle, AlertCircle, Loader2, Eye
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface FeeRecord {
  id: number;
  studentId: number;
  studentName?: string | null;
  semester?: number | null;
  academicYear?: string | null;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  dueDate?: string | null;
  paidDate?: string | null;
  paymentMode?: string | null;
  receiptNo?: string | null;
  transactionId?: string | null;
  bankName?: string | null;
  feeType?: string | null;
}

export function AdminFeesPage() {
  const { data, isLoading } = useListFees();
  const { data: students } = useListStudents();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editFee, setEditFee] = useState<FeeRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [addForm, setAddForm] = useState({
    studentId: "",
    semester: "",
    academicYear: "2024-25",
    totalFees: "",
    paidAmount: "0",
    dueDate: "",
    feeType: "Semester Fee",
    paymentMode: "Online",
    bankName: "ICICI BANK",
    transactionId: "",
    receiptNo: "",
  });

  const [editForm, setEditForm] = useState({
    paidAmount: "",
    paymentMode: "Online",
    bankName: "ICICI BANK",
    transactionId: "",
    receiptNo: "",
    paidDate: "",
    feeType: "Semester Fee",
  });

  const fees = Array.isArray(data) ? data as FeeRecord[] : [];
  const filtered = fees.filter(f =>
    (f.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
    String(f.studentId).includes(search) ||
    String(f.semester || "").includes(search) ||
    (f.receiptNo || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalPending = fees.reduce((s, f) => s + f.pendingAmount, 0);
  const paidCount = fees.filter(f => f.status === "paid").length;

  const statusBadge = (status: string) => {
    if (status === "paid") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Paid</Badge>;
    if (status === "partial") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Partial</Badge>;
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Pending</Badge>;
  };

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleAdd = async () => {
    if (!addForm.studentId || !addForm.semester || !addForm.totalFees) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        studentId: parseInt(addForm.studentId),
        semester: parseInt(addForm.semester),
        academicYear: addForm.academicYear,
        totalFees: parseFloat(addForm.totalFees),
        paidAmount: parseFloat(addForm.paidAmount || "0"),
        dueDate: addForm.dueDate || null,
        feeType: addForm.feeType,
        paymentMode: addForm.paymentMode,
        bankName: addForm.bankName,
      };
      if (addForm.transactionId) payload.transactionId = addForm.transactionId;
      if (addForm.receiptNo) payload.receiptNo = addForm.receiptNo;
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      await queryClient.invalidateQueries({ queryKey: ["listFees"] });
      showMsg("success", "Fee record created successfully!");
      setShowAdd(false);
      setAddForm({ studentId: "", semester: "", academicYear: "2024-25", totalFees: "", paidAmount: "0", dueDate: "", feeType: "Semester Fee", paymentMode: "Online", bankName: "ICICI BANK", transactionId: "", receiptNo: "" });
    } catch {
      showMsg("error", "Failed to create fee record.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (f: FeeRecord) => {
    setEditFee(f);
    setEditForm({
      paidAmount: String(f.paidAmount),
      paymentMode: f.paymentMode || "Online",
      bankName: f.bankName || "ICICI BANK",
      transactionId: f.transactionId || "",
      receiptNo: f.receiptNo || "",
      paidDate: f.paidDate ? f.paidDate.split("T")[0] : new Date().toISOString().split("T")[0],
      feeType: f.feeType || "Semester Fee",
    });
  };

  const handleEditSave = async () => {
    if (!editFee) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/fees/${editFee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paidAmount: parseFloat(editForm.paidAmount),
          paymentMode: editForm.paymentMode,
          bankName: editForm.bankName,
          transactionId: editForm.transactionId || null,
          receiptNo: editForm.receiptNo || null,
          paidDate: editForm.paidDate || null,
          feeType: editForm.feeType,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await queryClient.invalidateQueries({ queryKey: ["listFees"] });
      showMsg("success", "Payment updated successfully!");
      setEditFee(null);
    } catch {
      showMsg("error", "Failed to update payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 mt-1">Manage student fee records and payment receipts</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[#8b0000] hover:bg-[#6b0000]">
          <Plus className="w-4 h-4 mr-2" /> Add Fee Record
        </Button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium border ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Revenue Collected</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Pending Amount</p>
            <p className="text-3xl font-bold text-red-600 mt-1">₹{totalPending.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Fully Paid Students</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{paidCount} / {fees.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by student, semester, receipt no..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} records</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sem</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pending</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receipt No</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-500">
                        <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No fee records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{f.studentName || `Student #${f.studentId}`}</p>
                          <p className="text-xs text-gray-400">{f.feeType || "Semester Fee"}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">Sem {f.semester}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{f.academicYear || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold">₹{f.totalFees.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-semibold">₹{f.paidAmount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-semibold">₹{f.pendingAmount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {f.dueDate ? format(new Date(f.dueDate), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">{statusBadge(f.status)}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{f.receiptNo || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEdit(f)}>
                              <Edit2 className="w-3 h-3 mr-1" />Update
                            </Button>
                            {f.receiptNo && (
                              <Link href={`/student/fees/${f.id}/receipt`}>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                                  <Eye className="w-3 h-3 mr-1" />Receipt
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Fee Record Dialog */}
      <Dialog open={showAdd} onOpenChange={open => { if (!open) setShowAdd(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Add Fee Record
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Select Student *</Label>
              <select
                className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm bg-white"
                value={addForm.studentId}
                onChange={e => setAddForm(p => ({ ...p, studentId: e.target.value }))}
              >
                <option value="">— Select Student —</option>
                {(students || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.enrollmentNo})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Semester *</Label>
              <Input type="number" min={1} max={8} placeholder="e.g. 4" value={addForm.semester} onChange={e => setAddForm(p => ({ ...p, semester: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Academic Year</Label>
              <Input placeholder="2024-25" value={addForm.academicYear} onChange={e => setAddForm(p => ({ ...p, academicYear: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Total Fees (₹) *</Label>
              <Input type="number" placeholder="e.g. 135000" value={addForm.totalFees} onChange={e => setAddForm(p => ({ ...p, totalFees: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Paid Amount (₹)</Label>
              <Input type="number" placeholder="0" value={addForm.paidAmount} onChange={e => setAddForm(p => ({ ...p, paidAmount: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Fee Type</Label>
              <Input placeholder="Semester Fee" value={addForm.feeType} onChange={e => setAddForm(p => ({ ...p, feeType: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Due Date</Label>
              <Input type="date" value={addForm.dueDate} onChange={e => setAddForm(p => ({ ...p, dueDate: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Payment Mode</Label>
              <select className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm bg-white" value={addForm.paymentMode} onChange={e => setAddForm(p => ({ ...p, paymentMode: e.target.value }))}>
                <option>Online</option>
                <option>Bank Transfer</option>
                <option>NEFT</option>
                <option>Demand Draft</option>
                <option>Cash</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Bank Name</Label>
              <Input placeholder="ICICI BANK" value={addForm.bankName} onChange={e => setAddForm(p => ({ ...p, bankName: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</Label>
              <Input placeholder="UPI123..." value={addForm.transactionId} onChange={e => setAddForm(p => ({ ...p, transactionId: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Receipt No</Label>
              <Input placeholder="RCP-2024-001" value={addForm.receiptNo} onChange={e => setAddForm(p => ({ ...p, receiptNo: e.target.value }))} className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !addForm.studentId || !addForm.semester || !addForm.totalFees} className="bg-[#8b0000] hover:bg-[#6b0000]">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit / Update Payment Dialog */}
      <Dialog open={!!editFee} onOpenChange={open => { if (!open) setEditFee(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Update Payment — {editFee?.studentName || `Student #${editFee?.studentId}`}
            </DialogTitle>
          </DialogHeader>
          {editFee && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 mb-2">
              Semester {editFee.semester} | Total: ₹{editFee.totalFees.toLocaleString("en-IN")} | Current paid: ₹{editFee.paidAmount.toLocaleString("en-IN")}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Paid Amount (₹) *</Label>
              <Input type="number" value={editForm.paidAmount} onChange={e => setEditForm(p => ({ ...p, paidAmount: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Receipt No</Label>
              <Input placeholder="RCP-2024-001" value={editForm.receiptNo} onChange={e => setEditForm(p => ({ ...p, receiptNo: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Payment Date</Label>
              <Input type="date" value={editForm.paidDate} onChange={e => setEditForm(p => ({ ...p, paidDate: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Payment Mode</Label>
              <select className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm bg-white" value={editForm.paymentMode} onChange={e => setEditForm(p => ({ ...p, paymentMode: e.target.value }))}>
                <option>Online</option>
                <option>Bank Transfer</option>
                <option>NEFT</option>
                <option>Demand Draft</option>
                <option>Cash</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Bank Name</Label>
              <Input placeholder="ICICI BANK" value={editForm.bankName} onChange={e => setEditForm(p => ({ ...p, bankName: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</Label>
              <Input placeholder="UPI/NEFT reference number" value={editForm.transactionId} onChange={e => setEditForm(p => ({ ...p, transactionId: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Fee Type</Label>
              <Input placeholder="Semester Fee" value={editForm.feeType} onChange={e => setEditForm(p => ({ ...p, feeType: e.target.value }))} className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFee(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving} className="bg-[#8b0000] hover:bg-[#6b0000]">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
