"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  async function loadContext() {
    if (!token) { setMessage("This payment link is missing its secure token."); setState("error"); setLoading(false); return; }
    try {
      const response = await fetch(`/api/public/payments/context?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load payment");
      setContext(body.data);
      if (!body.data.payable) setState("success");
    } catch (error) { setMessage(error.message); setState("error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadContext(); }, [token]);

  async function pay() {
    setProcessing(true); setMessage("");
    try {
      const ready = await loadRazorpay();
      if (!ready) throw new Error("Unable to load the secure payment checkout. Please try again.");
      const response = await fetch("/api/razorpay/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentToken: token }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to create payment order");
      const order = body.data;
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: context.tournament.name,
        description: `${context.family.familyName} tournament registration`,
        order_id: order.orderId,
        handler: async (result) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result) });
            const verifyBody = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyBody.error || "Payment verification failed");
            setState("success"); setMessage("Payment verified. Your official registration confirmation is ready.");
            if (verifyBody.data?.confirmationUrl) {
              setTimeout(() => router.push(verifyBody.data.confirmationUrl), 700);
            } else {
              await loadContext();
            }
          } catch (error) { setState("error"); setMessage(error.message); }
          finally { setProcessing(false); }
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: "#0f172a" },
      });
      razorpay.on("payment.failed", (failure) => { setState("error"); setMessage(failure?.error?.description || "Payment was not completed."); setProcessing(false); });
      razorpay.open();
    } catch (error) { setState("error"); setMessage(error.message); setProcessing(false); }
  }

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-24 text-sm text-slate-500">Loading secure payment…</main>;

  return <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
    <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Secure registration payment</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{context?.tournament?.name || "Tournament payment"}</h1><p className="mt-2 text-sm text-slate-600">The amount below is calculated from your tournament registrations on the server. It cannot be changed in this page.</p></div>
    {state === "error" && !context ? <Card className="border-red-200"><CardContent className="flex gap-3 p-6 text-red-800"><TriangleAlert className="h-5 w-5 shrink-0"/><p>{message}</p></CardContent></Card> : <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>{context?.family?.familyName}</CardTitle><CardDescription>Registration fee summary</CardDescription></CardHeader><CardContent className="space-y-4">
        {(context?.registrations || []).map((item) => <div key={item.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0"><div><p className="font-medium text-slate-950">{item.game?.name}</p><p className="mt-1 text-xs text-slate-500">{String(item.game?.category || "").replaceAll("_", " ")}</p></div><div className="text-right"><p className="font-semibold">₹{Number(item.paymentAmount || 0).toLocaleString("en-IN")}</p><Badge variant={item.paymentStatus === "COMPLETED" ? "default" : "outline"}>{item.paymentStatus}</Badge></div></div>)}
        <div className="flex items-end justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">Amount due</p><p className="mt-1 text-xs text-slate-500">INR · server verified</p></div><strong className="text-2xl">₹{Number(context?.amountDue || 0).toLocaleString("en-IN")}</strong></div>
        {state === "success" ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5"/>Payment complete</div><p className="mt-1">{message || "There is no outstanding registration fee on this payment link."}</p>{context?.confirmationUrl && <Button type="button" size="sm" variant="outline" className="mt-3 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50" onClick={() => router.push(context.confirmationUrl)}>Open registration confirmation</Button>}</div> : <><Button className="w-full" size="lg" onClick={pay} disabled={processing || !context?.payable}>{processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-2 h-4 w-4"/>}Pay ₹{Number(context?.amountDue || 0).toLocaleString("en-IN")}</Button>{message && <p className="text-sm text-red-700">{message}</p>}</>}
      </CardContent></Card>
      <div className="space-y-4"><Card><CardContent className="p-5"><div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4"/>Protected checkout</div><p className="mt-2 text-xs leading-5 text-slate-500">The server selects the registrations and amount. Razorpay card/UPI details never pass through this application.</p></CardContent></Card><Card><CardContent className="p-5 text-xs leading-5 text-slate-500">If checkout succeeds but this page is interrupted, payment verification can safely be retried and administrators can reconcile a completed payment.</CardContent></Card></div>
    </div>}
  </main>;
}
