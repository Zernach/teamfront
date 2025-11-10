// services/api/customerApi.ts
import { apiClient } from './client';

export interface CustomerSummary {
  id: string;
  fullName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  outstandingBalance: number;
  activeInvoicesCount: number;
}

export interface CustomerDetail {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  outstandingBalance: number;
  activeInvoicesCount: number;
  totalInvoiced: number;
  totalPaid: number;
  createdAt: string;
  lastModifiedAt: string;
}

export interface PagedCustomerList {
  customers: CustomerSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
}

export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
}

export const customerApi = {
  async listCustomers(params?: {
    status?: string;
    searchTerm?: string;
    sortBy?: string;
    sortDirection?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedCustomerList> {
    return apiClient.get<PagedCustomerList>('/api/v1/customers', params);
  },

  async getCustomerById(id: string): Promise<CustomerDetail> {
    return apiClient.get<CustomerDetail>(`/api/v1/customers/${id}`);
  },

  async createCustomer(data: CreateCustomerRequest): Promise<CustomerDetail> {
    return apiClient.post<CustomerDetail>('/api/v1/customers', data);
  },

  async updateCustomer(
    id: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerDetail> {
    return apiClient.put<CustomerDetail>(`/api/v1/customers/${id}`, data);
  },

  async deleteCustomer(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/customers/${id}`);
  },
};



