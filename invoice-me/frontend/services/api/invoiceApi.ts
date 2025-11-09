// services/api/invoiceApi.ts
import { apiClient } from './client';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceDetail {
  id: string;
  customerId: string;
  invoiceNumber: string | null;
  invoiceDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  notes?: string;
  createdAt: string;
  lastModifiedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface CreateInvoiceRequest {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  taxAmount?: number;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  invoiceDate?: string;
  dueDate?: string;
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  taxAmount?: number;
  notes?: string;
}

export interface MarkInvoiceAsSentRequest {
  sentDate?: string;
}

export const invoiceApi = {
  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceDetail> {
    return apiClient.post<InvoiceDetail>('/api/v1/invoices', data);
  },

  async updateInvoice(
    id: string,
    data: UpdateInvoiceRequest
  ): Promise<InvoiceDetail> {
    return apiClient.put<InvoiceDetail>(`/api/v1/invoices/${id}`, data);
  },

  async markInvoiceAsSent(
    id: string,
    data?: MarkInvoiceAsSentRequest
  ): Promise<InvoiceDetail> {
    return apiClient.post<InvoiceDetail>(
      `/api/v1/invoices/${id}/mark-as-sent`,
      data || {}
    );
  },
};


