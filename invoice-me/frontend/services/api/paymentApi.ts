// services/api/paymentApi.ts
import { apiClient } from './client';

export interface PaymentDetail {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  referenceNumber?: string;
  status: 'APPLIED' | 'VOIDED';
  notes?: string;
  createdAt: string;
  createdBy: string;
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
}

export interface VoidPaymentRequest {
  voidReason: string;
}

export const paymentApi = {
  async voidPayment(
    id: string,
    data: VoidPaymentRequest
  ): Promise<PaymentDetail> {
    return apiClient.post<PaymentDetail>(`/payments/${id}/void`, data);
  },
};

