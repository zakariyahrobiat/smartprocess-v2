import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endPoint";
import type { Vendor } from "@/types/ims.types";


export const getVendors = async (data: { country: string }): Promise<Vendor[]> => {
  const res = await apiClient.get(ENDPOINTS.vendors.getAll, { params: data });
  return res.data.items;
};

export const createInvoice = async (data: {
  invoiceNumber: string,
  lineManagerName: string,
  lineManagerEmail: string,
  department: string,
  costCenter: string,
  vendor: string,
  amount: number,
  poNumber: string,
  description: string,
  cc: string,
  country: string,
  currency: string,
  attachmentLinks: string[]
}) => {
  const res = await apiClient.post(ENDPOINTS.ims.create, data);
  return res.data;
};
export const getInvoices = async (params: {
  search?: string;
  status?: string;
  country?: string;
  submitterEmail?: string;
  vendor?: string;
  page?: number;
  pageSize?: number;
}) => {
  const res = await apiClient.get(ENDPOINTS.ims.invoices, { params });
  return res.data;
};
export const getInvoice = async (id: string) => {
  const res = await apiClient.get(ENDPOINTS.ims.invoice(id));
  return res.data;
};
export const getAnalytics = async () => {
  const res = await apiClient.get(ENDPOINTS.ims.analytics);
  return res.data;
}
