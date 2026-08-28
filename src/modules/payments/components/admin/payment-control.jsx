"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDollarSign, RefreshCcw, Search, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const label = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function PaymentControl({ initialPayments, initialOutstanding }) {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [method, setMethod] = useState("UPI");
  const [reference, setReference] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = useMemo(() => initialOutstanding.filter((item) => `${item.participation?.family?.familyName} ${item.game?.name} ${item.game?.tournament?.name}`.toLowerCase().includes(search.toLowerCase())), [initialOutstanding, search]);
  const pendingValue = initialOutstanding.reduce((sum, item) => sum + Number(item.paymentAmount || 0), 0);
  const paidValue = initialPayments.filter((item) => item.status === "COMPLETED").reduce((sum, item) => sum + Number(item.amount || 0), 0);

  async function recordManual() {
    if (!selected.length) return toast.error("Select at least one outstanding registration");
    setSaving(true);
    try {
      const response = await fetch("/api/payments/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationIds: selected, paymentMethod: method, reference: reference || undefined }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to record payment");
      toast.success("Manual payment recorded"); setSelected([]); setReference(""); router.refresh();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }

  async function reconcile(id) {
    try {
      const response = await fetch(`/api/payments/${id}/reconcile`, { method: "POST" });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to reconcile payment");
      toast.success("Payment reconciled"); router.refresh();
    } catch (error) { toast.error(error.message); }
  }

  return <div className="space-y-6">
    <div className="page-header"><div><p className="page-eyebrow">Finance operations</p><h1 className="page-title">Registration payments</h1><p className="page-description">Review tournament fee collection, record verified offline payments and reconcile completed provider transactions.</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Collected", money(paidValue)], ["Outstanding", money(pendingValue)], ["Completed payments", initialPayments.filter((p) => p.status === "COMPLETED").length], ["Open registrations", initialOutstanding.length]].map(([title,value]) => <Card key={title}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{value}</p></CardContent></Card>)}</div>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5"/>Outstanding registration fees</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input className="pl-9" placeholder="Search family, event or tournament" value={search} onChange={(e) => setSearch(e.target.value)}/></div><select className="h-10 rounded-md border bg-background px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>{["UPI","CASH","BANK_TRANSFER","CHEQUE","PAYTM","PHONEPE","GPAY","OTHER"].map((m) => <option key={m} value={m}>{label(m)}</option>)}</select><Input className="lg:w-56" placeholder="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)}/><Button onClick={recordManual} disabled={saving || !selected.length}>Record selected paid</Button></div>
      <p className="text-xs text-slate-500">For safety, one manual payment can only contain registrations from the same family and tournament. The server enforces this even if mixed rows are selected.</p>
      <div className="responsive-table-wrap"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-3"></th><th>Family</th><th>Tournament / event</th><th>Status</th><th className="text-right">Amount</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="py-3 pr-3"><Checkbox checked={selected.includes(item.id)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, item.id] : current.filter((id) => id !== item.id))}/></td><td className="py-3 font-medium">{item.participation?.family?.familyName}</td><td><div>{item.game?.tournament?.name}</div><div className="text-xs text-slate-500">{item.game?.name}</div></td><td><Badge variant="outline">{label(item.paymentStatus)}</Badge></td><td className="text-right font-semibold">{money(item.paymentAmount)}</td></tr>)}</tbody></table></div>
      {!filtered.length && <p className="py-8 text-center text-sm text-slate-500">No outstanding registration fees found.</p>}
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5"/>Payment ledger</CardTitle></CardHeader><CardContent><div className="responsive-table-wrap"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="py-3">Date</th><th>Receipt</th><th>Family</th><th>Method</th><th>Status</th><th className="text-right">Amount</th><th></th></tr></thead><tbody>{initialPayments.map((payment) => <tr key={payment.id} className="border-b last:border-0"><td className="py-3">{new Date(payment.createdAt).toLocaleDateString()}</td><td className="font-mono text-xs">{payment.receiptNumber || payment.orderId || "—"}</td><td>{payment.family?.familyName || payment.payerName}</td><td>{label(payment.paymentMethod)}</td><td><Badge variant={payment.status === "COMPLETED" ? "default" : "outline"}>{label(payment.status)}</Badge></td><td className="text-right font-semibold">{money(payment.amount)}</td><td className="text-right">{payment.status === "COMPLETED" && payment.registrationIds?.length > 0 && <Button variant="ghost" size="sm" onClick={() => reconcile(payment.id)}><RefreshCcw className="mr-2 h-3.5 w-3.5"/>Reconcile</Button>}</td></tr>)}</tbody></table></div></CardContent></Card>
  </div>;
}
