import { useAuth } from "@/context/auth-provider";
import { CURRENCY_BY_COUNTRY, IMS_COUNTRIES, IMS_CURRENCIES, submitRefundToFirestore } from "@/lib/imsService";
import type { RefundFormData } from "@/lib/imsTypes";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import FormHeader from "./formHeader";
import CustomInput from "./customInput";
import { useNavigate } from "react-router-dom";
import NIGERIAN_BANKS from "../ims/bankList";

function RefundForm() {
    const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [form, setForm] = useState<RefundFormData>({
    referenceNumber: "",
    country: "Nigeria",
    customerName: "",
    accountNumber: "",
    bankName: "",
    currency: "NGN",
    amount: 0,
    ccEmails: "",
    reason: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
  };

  useEffect(() => {
    setForm((f) => ({ ...f, currency: CURRENCY_BY_COUNTRY[f.country] }));
  }, [form.country]);

  const validateAccount = (val: string) => {
    if (val && !/^\d{10}$/.test(val)) {
      setAccountError("Account number must be exactly 10 digits");
    } else {
      setAccountError("");
    }
  };

  const handleSubmit = async () => {
    if (
      !form.referenceNumber ||
      !form.customerName ||
      !form.accountNumber ||
      !form.bankName ||
      !form.amount ||
      !form.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^\d{10}$/.test(form.accountNumber)) {
      toast.error("Account number must be exactly 10 digits");
      return;
    }
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await submitRefundToFirestore(
        form,
        currentUser.email,
        currentUser.displayName,
      );
      toast.success("Refund request submitted successfully!");
      navigate("/ims/refunds");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <FormHeader
        title="Refund Request"
        description="Customer refund details"
        backLink="/ims/refunds"
      />
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Refund Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <CustomInput
            required
            label="Reference Number"
            name="referenceNumber"
            value={form.referenceNumber}
            onChange={handleFormChange}
            placeholder="e.g. REF-2024-001"
          />
          <CustomInput
            variant="select"
            label="Country"
            required
            name="location"
            value={form.country}
            onChange={handleFormChange}
            option={IMS_COUNTRIES.map((item) => ({ label: item, value: item }))}
          />
          <CustomInput
            required
            label="Customer's Name"
            name="customerName"
            value={form.customerName}
            placeholder="e.g. Boluwatife Lawal"
            onChange={handleFormChange}
          />
          <div>
            <CustomInput
              required
              label="Account Number"
              name="accountNumber"
              value={form.accountNumber}
              placeholder="0123456789"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm((f) => ({ ...f, accountNumber: val }));
                validateAccount(val);
              }}
              maxLength={10}
              className={`${accountError && "border-red-500 focus:border-red-500"}`}
            />
            {accountError && (
              <p className="text-xs text-red-400 mt-1">{accountError}</p>
            )}
            {form.accountNumber &&
              !accountError &&
              form.accountNumber.length === 10 && (
                <p className="text-xs text-green-400 mt-1">
                  ✓ Valid account number
                </p>
              )}
          </div>
          <CustomInput
            variant="select"
            label="Bank Name"
            required
            name="bankName"
            value={form.bankName}
            onChange={handleFormChange}
            option={NIGERIAN_BANKS.map((item) => ({
              label: item,
              value: item,
            }))}
          />

          <CustomInput
            label="Currency"
            variant="select"
            required
            placeholder="Select currency..."
            name="currency"
            value={form.currency}
            onChange={handleFormChange}
            option={IMS_CURRENCIES.map((currency) => ({
              label: currency,
              value: currency,
            }))}
          />
          <CustomInput
            label="Refund Amount"
            required
            type="number"
            placeholder="Enter amount..."
            name="amount"
            value={form.amount}
            onChange={handleFormChange}
          />
          <CustomInput
            optional
            label="CC Emails"
            placeholder="e.g. manager@sunking.com, finance@sunking.com"
            name="ccEmails"
            value={form.ccEmails}
            onChange={handleFormChange}
          />
        </div>
        <CustomInput
          variant="textarea"
          label="Reason for Refund"
          required
          placeholder="Explain why this refund is being requested..."
          name="description"
          value={form.reason}
          onChange={handleFormChange}
          className="min-h-20"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate("/ims/refunds")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white min-w-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Plus className="size-4" /> Submit Refund
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default RefundForm;
