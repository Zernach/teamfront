import { apiClient } from './apiClient';

export enum JobType {
  Flooring = 1,
  Tile = 2,
  Carpet = 3,
  Hardwood = 4,
  Laminate = 5,
  Vinyl = 6,
  Linoleum = 7,
  Bamboo = 8,
  Cork = 9,
  Concrete = 10,
  Marble = 11,
  Granite = 12,
  Stone = 13,
  Other = 99,
}

export enum JobStatus {
  Open = 1,
  Assigned = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
}

export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export interface BaseLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  type: JobType;
  status: JobStatus;
  desiredDate: string;
  duration: string;
  priority: Priority;
  location: BaseLocation;
  specialRequirements: string[];
  assignedContractorId?: string;
  assignedContractorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListItem {
  id: string;
  jobNumber: string;
  type: JobType;
  status: JobStatus;
  desiredDate: string;
  duration: string;
  priority: Priority;
  address: string;
  city: string;
  state: string;
  assignedContractorId?: string;
  assignedContractorName?: string;
}

export interface CreateJobRequest {
  type: JobType;
  types?: JobType[]; // For multi-select support
  otherTypeText?: string; // For "Other" option text
  desiredDate: string;
  location: BaseLocation;
  duration: string;
  priority?: Priority;
  specialRequirements?: string[];
}

export interface PagedResult<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

class JobService {
  async getAll(params?: {
    search?: string;
    status?: JobStatus;
    type?: JobType;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<JobListItem>> {
    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.status !== undefined) queryParams.status = params.status.toString();
    if (params?.type !== undefined) queryParams.type = params.type.toString();
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();

    return apiClient.get<PagedResult<JobListItem>>('/api/jobs', queryParams);
  }

  async getById(id: string): Promise<Job> {
    return apiClient.get<Job>(`/api/jobs/${id}`);
  }

  async create(data: CreateJobRequest): Promise<Job> {
    return apiClient.post<Job>('/api/jobs', data);
  }
}

export const jobService = new JobService();

