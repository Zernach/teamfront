// Contractor types matching backend DTOs
export enum ContractorType {
  Flooring = 1,
  Tile = 2,
  Carpet = 3,
  Multi = 4,
}

export enum ContractorStatus {
  Active = 1,
  Inactive = 2,
  OnLeave = 3,
}

export interface BaseLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}

export interface Contractor {
  id: string;
  name: string;
  type: ContractorType;
  rating: number;
  status: ContractorStatus;
  phoneNumber: string;
  email: string;
  baseLocation: BaseLocation;
  skills: string[];
  workingHours: WorkingHours[];
  availabilityStatus?: string;
  statistics?: ContractorStatistics;
  createdAt: string;
  updatedAt: string;
  rowVersion?: string; // Base64 encoded for concurrency control
}

export interface ContractorStatistics {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  averageRating: number;
}

export interface ContractorListItem {
  id: string;
  name: string;
  type: ContractorType;
  rating: number;
  status: ContractorStatus;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  availabilityStatus: string;
}

export interface CreateContractorRequest {
  name: string;
  type: ContractorType;
  phoneNumber: string;
  email: string;
  baseLocation: BaseLocation;
  skills?: string[];
  workingHours?: WorkingHours[];
}

export interface UpdateContractorRequest {
  name?: string;
  type?: ContractorType;
  phoneNumber?: string;
  email?: string;
  baseLocation?: BaseLocation;
  skills?: string[];
  workingHours?: WorkingHours[];
  status?: ContractorStatus;
  rowVersion?: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface ListContractorsParams {
  name?: string;
  type?: ContractorType;
  minRating?: number;
  maxRating?: number;
  city?: string;
  state?: string;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

