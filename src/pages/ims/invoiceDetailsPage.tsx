import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { getInvoiceById, type Invoice } from "@/lib/imsService";
import InvoiceDetail from "@/components/ims/invoiceDetail";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, can } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const canApprove =
    can("ims_approve_invoice_finance") ||
    can("ims_approve_invoice_senior") ||
    can("ims_approve_invoice_line_manager");

  const canMarkPaid = can("ims_mark_invoice_paid");

  useEffect(() => {
    if (!id) return;

    getInvoiceById(id).then((data) => {
      setInvoice(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <InvoiceDetail
      invoice={invoice}
      userEmail={currentUser?.email ?? ""}
      canApprove={canApprove}
      canMarkPaid={canMarkPaid}
      onBack={() => navigate("/ims/invoices")}
    />
  );
}
