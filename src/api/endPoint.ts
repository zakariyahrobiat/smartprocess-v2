
export const ENDPOINTS = {
  ims: {
    invoices: "/api/ims/invoices",
    invoice: (id: string) => `/api/ims/invoices/${id}`,
    create: "/api/ims/invoices",
    update: (id: string) => `/invoice/${id}`,
    analytics: "/api/ims/analytics",
  },

  vendors: {
    getAll: "/api/config/vendors",
  },
};