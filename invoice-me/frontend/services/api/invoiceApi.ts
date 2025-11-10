// services/api/invoiceApi.ts
import { apiClient } from './client';

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder?: number;
}

export interface CustomerSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface PaymentSummary {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  status: string;
}

export interface InvoiceDetail {
  id: string;
  customerId: string;
  customer?: CustomerSummary;
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
  payments?: PaymentSummary[];
  createdAt: string;
  lastModifiedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string | null;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  balance: number;
  overdue: boolean;
}

export interface PagedInvoiceList {
  invoices: InvoiceSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalAmountSum: number;
  totalBalanceSum: number;
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

export interface RecordPaymentRequest {
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  referenceNumber?: string;
  notes?: string;
}

export interface CancelInvoiceRequest {
  cancellationReason: string;
}

export interface ListInvoicesParams {
  customerId?: string;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  fromDate?: string;
  toDate?: string;
  overdue?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  pageNumber?: number;
  pageSize?: number;
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

  async getInvoiceById(id: string): Promise<InvoiceDetail> {
    return apiClient.get<InvoiceDetail>(`/api/v1/invoices/${id}`);
  },

  async listInvoices(params?: ListInvoicesParams): Promise<PagedInvoiceList> {
    return apiClient.get<PagedInvoiceList>('/api/v1/invoices', params);
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

  async recordPayment(
    id: string,
    data: RecordPaymentRequest
  ): Promise<any> {
    return apiClient.post(`/api/v1/invoices/${id}/payments`, data);
  },

  async cancelInvoice(
    id: string,
    data: CancelInvoiceRequest
  ): Promise<InvoiceDetail> {
    return apiClient.post<InvoiceDetail>(`/api/v1/invoices/${id}/cancel`, data);
  },
};



