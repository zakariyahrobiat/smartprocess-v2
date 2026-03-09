import { AlertCircle, ArrowLeft, Loader2, Plus, Upload, X } from "lucide-react";
import CustomInput from "./customInput";
import { AMOUNT_THRESHOLDS, CURRENCY_BY_COUNTRY, DEPARTMENTS, getCostCenters, getVendors, IMS_COUNTRIES, IMS_CURRENCIES, submitInvoice, type CostCenter, type IMSCountry, type InvoiceFormData, type Manager, type Vendor } from "@/lib/imsService";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import FormatAmount from "../formatAmount";
const InvoiceForm = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  const [showCcSuggestions, setShowCcSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const required = <span className="text-destructive ml-0.5">*</span>;
  const [input, setInput] = useState<InvoiceFormData>({
    invoiceNo: "",
    vendor: "",
    costCenter: "",
    department: "",
    currency: "",
    amount: 0,
    poNumber: "",
    description: "",
    ccEmails: "",
    location: "Nigeria",
    managers: [],
    fileUrls: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };
  const isProcurement = input.department === "Operation & Procurement";
  const [managers, setManagers] = useState<Manager[]>([
    { name: "", email: "" },
  ]);

  const addManager = () => setManagers((m) => [...m, { name: "", email: "" }]);
  const removeManager = (i: number) =>
    setManagers((m) => m.filter((_, idx) => idx !== i));
  const updateManager = (i: number, field: keyof Manager, val: string) =>
    setManagers((m) =>
      m.map((mgr, idx) => (idx === i ? { ...mgr, [field]: val } : mgr)),
    );

    useEffect(() => {
      if (input.location) {
        setInput((f) => ({ ...f, currency: CURRENCY_BY_COUNTRY[input.location as IMSCountry] }))
      }
    }, [input.location])

  const handleSubmit = async () => {
    if (
      !input.invoiceNo ||
      !input.vendor ||
      !input.costCenter ||
      !input.department ||
      !input.amount ||
      !input.location ||
      !input.currency ||
      !input.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isProcurement && managers.some((m) => !m.name || !m.email)) {
      toast.error("Please complete all manager fields");
      return;
    }
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await submitInvoice(
        {
          ...input,
          managers: isProcurement ? [] : managers,
        } as InvoiceFormData,
        currentUser.email,
        currentUser.displayName,
      );
    toast.success("Invoice submitted successfully!");
    navigate("/ims/invoices");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredCc =
    ccSearch.length > 1
      ? costCenters
          .filter(
            (c) =>
              c.name.toLowerCase().includes(ccSearch.toLowerCase()) ||
              c.code.toLowerCase().includes(ccSearch.toLowerCase()),
          )
          .slice(0, 8)
      : [];
  const filteredVendors =
    vendorSearch.length > 1
      ? vendors
          .filter(
            (v) =>
              v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
              v.code.toLowerCase().includes(vendorSearch.toLowerCase()),
          )
          .slice(0, 8)
      : [];
  useEffect(() => {
    getVendors()
      .then(setVendors)
      .catch(() => {});
    getCostCenters()
      .then(setCostCenters)
      .catch(() => {});
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/ims/invoices")}
          className="text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Submit Invoice</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to submit for approval
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Invoice Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <CustomInput
            label="Invoice Number"
            required
            placeholder="e.g. INV-2024-001"
            name="invoiceNo"
            value={input.invoiceNo}
            onChange={handleInputChange}
          />

          <div className="relative">
            <CustomInput
              label="Vendor"
              required
              placeholder="Search vendor.."
              name="vendor"
              value={input.vendor}
              onChange={(e) => {
                handleInputChange(e);
                setVendorSearch(e.target.value);
                setShowVendorSuggestions(true);
              }}
              onFocus={() => setShowVendorSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowVendorSuggestions(false), 200)
              }
            />
            {showVendorSuggestions && filteredVendors.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {filteredVendors.map((v) => (
                  <li
                    key={v.id}
                    className="px-3 py-2.5 cursor-pointer hover:bg-accent text-sm"
                    onMouseDown={() => {
                      setVendorSearch(v.name);
                      setInput((prev) => ({
                        ...prev,
                        vendor: v.name,
                      }));
                      setShowVendorSuggestions(false);
                    }}
                  >
                    <p className="font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Code: {v.code}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <CustomInput
              label="Cost Center"
              required
              placeholder="Search cost center..."
              name="costCenter"
              value={input.costCenter}
              onChange={(e) => {
                handleInputChange(e);
                setCcSearch(e.target.value);
                setShowCcSuggestions(true);
              }}
              onFocus={() => setShowCcSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCcSuggestions(false), 200)}
            />

            {showCcSuggestions && filteredCc.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {filteredCc.map((c) => (
                  <li
                    key={c.id}
                    className="px-3 py-2.5 cursor-pointer hover:bg-accent text-sm"
                    onMouseDown={() => {
                      setCcSearch(c.name);
                      setInput((f) => ({
                        ...f,
                        costCenter: `${c.code}: ${c.name}`,
                      }));
                      setShowCcSuggestions(false);
                    }}
                  >
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Code: {c.code}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <CustomInput
            variant="select"
            label="Department"
            required
            placeholder="Search department..."
            name="department"
            value={input.department}
            onChange={handleInputChange}
            option={DEPARTMENTS.map((item) => ({ label: item, value: item }))}
          />

          <CustomInput
            variant="select"
            label="Country"
            required
            name="location"
            value={input.location}
            onChange={handleInputChange}
            option={IMS_COUNTRIES.map((item) => ({ label: item, value: item }))}
          />

          <CustomInput
            label="Currency"
            variant="select"
            required
            placeholder="Select currency..."
            name="currency"
            value={input.currency}
            onChange={handleInputChange}
            option={IMS_CURRENCIES.map((currency) => ({
              label: currency,
              value: currency,
            }))}
          />
          <div>
            <CustomInput
              label="Amount"
              required
              type="number"
              placeholder="Enter amount..."
              name="amount"
              value={input.amount}
              onChange={handleInputChange}
            />
            {input.amount && input.location && (
              <p className="text-xs text-muted-foreground mt-1">
                {FormatAmount(input.amount, input.currency ?? "NGN")}
                {input.amount >=
                  (AMOUNT_THRESHOLDS[input.location as IMSCountry] ??
                    Infinity) && (
                  <span className="ml-2 text-yellow-400">
                    ⚠ Requires Senior Manager approval
                  </span>
                )}
              </p>
            )}
          </div>

          <CustomInput
            label="PO Number"
            optional
            placeholder="e.g. PO-2024-001"
            name="poNumber"
            value={input.poNumber || ""}
            onChange={handleInputChange}
          />
        </div>
        <CustomInput
          variant="textarea"
          label="Description"
          required
          placeholder="Describe the purpose of this invoice..."
          name="description"
          value={input.description}
          onChange={handleInputChange}
          className="min-h-20"
        />

        <div>
          <CustomInput
            label="CC Emails (comma-separated, optional)"
            placeholder="e.g. manager@sunking.com, finance@sunking.com"
            name="ccEmails"
            value={input.ccEmails}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {(!isProcurement && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold text-foreground">
              Approval Managers{required}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={addManager}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3" /> Add Manager
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Managers are notified sequentially — manager 1 first, then 2, etc.
          </p>

          {managers.map((mgr, i) => (
            <div className="flex w-full gap-2">
              <div
                key={i}
                className="w-full grid gap-3 sm:grid-cols-2 items-end"
              >
                <CustomInput
                  label={`Manager ${i + 1} Name`}
                  required
                  placeholder="Full name"
                  name={`managerName${i}`}
                  value={mgr.name}
                  onChange={(e) => updateManager(i, "name", e.target.value)}
                />

                <CustomInput
                  label={`Manager ${i + 1} Email`}
                  required
                  placeholder="email@sunking.com"
                  name={`managerEmail${i}`}
                  value={mgr.email}
                  // onChange={handleInputChange}
                  onChange={(e) => updateManager(i, "email", e.target.value)}
                />
              </div>
              {managers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mb-0 mt-5 text-destructive hover:text-destructive"
                  onClick={() => removeManager(i)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )) || (
        <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-4 flex items-start gap-3">
          <AlertCircle className="size-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-300">
            <span className="font-medium">Operation & Procurement</span> — this
            request goes directly to Finance, skipping Line Manager approval.
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate("/ims/invoices")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-36"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Upload className="size-4" /> Submit Invoice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default InvoiceForm