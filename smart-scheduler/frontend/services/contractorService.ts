import { 
  Contractor, 
  ContractorListItem, 
  CreateContractorRequest, 
  UpdateContractorRequest,
  ListContractorsParams,
  PagedResult 
} from './types/contractor';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

class ContractorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/contractors`;
  }

  async createContractor(data: CreateContractorRequest): Promise<Contractor> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create contractor' }));
      throw new Error(error.message || 'Failed to create contractor');
    }

    return response.json();
  }

  async getContractorById(id: string): Promise<Contractor> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Contractor not found');
      }
      throw new Error('Failed to fetch contractor');
    }

    return response.json();
  }

  async listContractors(params: ListContractorsParams = {}): Promise<PagedResult<ContractorListItem>> {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.type !== undefined) queryParams.append('type', params.type.toString());
    if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    if (params.maxRating !== undefined) queryParams.append('maxRating', params.maxRating.toString());
    if (params.city) queryParams.append('city', params.city);
    if (params.state) queryParams.append('state', params.state);
    if (params.includeInactive) queryParams.append('includeInactive', 'true');
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch contractors');
    }

    return response.json();
  }

  async updateContractor(id: string, data: UpdateContractorRequest): Promise<Contractor> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Contractor not found');
      }
      if (response.status === 409) {
        throw new Error('Contractor has been modified by another user. Please refresh and try again.');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to update contractor' }));
      throw new Error(error.message || 'Failed to update contractor');
    }

    return response.json();
  }

  async deactivateContractor(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Contractor not found');
      }
      throw new Error('Failed to deactivate contractor');
    }
  }

  async restoreContractor(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/restore`, {
      method: 'POST',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Contractor not found');
      }
      throw new Error('Failed to restore contractor');
    }
  }
}

export const contractorService = new ContractorService();

