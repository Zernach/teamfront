import { 
  Contractor, 
  ContractorListItem, 
  CreateContractorRequest, 
  UpdateContractorRequest,
  ListContractorsParams,
  PagedResult 
} from './types/contractor';
import { apiClient } from './apiClient';

class ContractorService {
  async createContractor(data: CreateContractorRequest): Promise<Contractor> {
    return apiClient.post<Contractor>('/api/contractors', data);
  }

  async getContractorById(id: string): Promise<Contractor> {
    return apiClient.get<Contractor>(`/api/contractors/${id}`);
  }

  async listContractors(params: ListContractorsParams = {}): Promise<PagedResult<ContractorListItem>> {
    const queryParams: Record<string, any> = {};
    
    if (params.name) queryParams.name = params.name;
    if (params.type !== undefined) queryParams.type = params.type.toString();
    if (params.minRating !== undefined) queryParams.minRating = params.minRating.toString();
    if (params.maxRating !== undefined) queryParams.maxRating = params.maxRating.toString();
    if (params.city) queryParams.city = params.city;
    if (params.state) queryParams.state = params.state;
    if (params.includeInactive) queryParams.includeInactive = 'true';
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    return apiClient.get<PagedResult<ContractorListItem>>('/api/contractors', queryParams);
  }

  async updateContractor(id: string, data: UpdateContractorRequest): Promise<Contractor> {
    return apiClient.put<Contractor>(`/api/contractors/${id}`, data);
  }

  async deactivateContractor(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/contractors/${id}`);
  }

  async restoreContractor(id: string): Promise<void> {
    return apiClient.post<void>(`/api/contractors/${id}/restore`);
  }
}

export const contractorService = new ContractorService();

