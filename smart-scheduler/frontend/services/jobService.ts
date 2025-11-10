import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getAll(params?: {
    search?: string;
    status?: JobStatus;
    type?: JobType;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<JobListItem>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.type !== undefined) queryParams.append('type', params.type.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${this.baseUrl}/api/jobs?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }
    return response.json();
  }

  async getById(id: string): Promise<Job> {
    const response = await fetch(`${this.baseUrl}/api/jobs/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Job not found');
      }
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }
    return response.json();
  }

  async create(data: CreateJobRequest): Promise<Job> {
    const response = await fetch(`${this.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to create job');
    }

    return response.json();
  }
}

export const jobService = new JobService();

