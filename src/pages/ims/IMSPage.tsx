
import { useAuth } from "@/context/auth-provider";
import { ShieldAlert, Receipt, RefreshCw } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function IMSPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = useAuth();

  const canViewInvoices =
    can("ims_view_own_invoices") || can("ims_view_all_invoices");

  const canViewRefunds =
    can("ims_submit_refund") || can("ims_view_all_refunds");

  const activeTab = location.pathname.includes("refunds")
    ? "refunds"
    : "invoices";

  if (!canViewInvoices && !canViewRefunds) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-white text-xl font-semibold">Access Denied</h2>
        <p className="text-gray-400 text-sm">
          You don't have permission to access IMS.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Invoice Management System
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage invoices and refunds across all countries
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {canViewInvoices && (
          <button
            onClick={() => navigate("/ims/invoices")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-green-500 text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Invoices
          </button>
        )}

        {canViewRefunds && (
          <button
            onClick={() => navigate("/ims/refunds")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "refunds"
                ? "border-green-500 text-green-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refunds
          </button>
        )}
      </div>

      <Outlet />
    </div>
  );
}