import { JobType, BaseLocation } from './jobService';
import { apiClient } from './apiClient';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: string;
}

export interface ScoringDetails {
  availabilityScore: number;
  ratingScore: number;
  distanceScore: number;
  availabilityWeight: number;
  ratingWeight: number;
  distanceWeight: number;
  explanation?: string;
}

export interface RankedContractor {
  rank: number;
  contractor: {
    id: string;
    name: string;
    type: number;
    rating: number;
    status: number;
    phoneNumber: string;
    email: string;
    city: string;
    state: string;
  };
  score: number;
  scoreBreakdown: ScoringDetails;
  availableTimeSlots: TimeSlot[];
  distanceFromJob: number;
  estimatedTravelTime: number;
}

export interface RecommendationResponse {
  jobId: string;
  jobDetails: {
    jobNumber: string;
    type: JobType;
    location: BaseLocation;
    desiredDate: string;
    duration: string;
  };
  recommendations: RankedContractor[];
  generatedAt: string;
}

export interface CreateAssignmentRequest {
  jobId: string;
  contractorId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
}

export interface CreateAssignmentResponse {
  id: string;
  jobId: string;
  contractorId: string;
  status: number;
  score: number;
  scoreBreakdown: ScoringDetails;
  scheduledStartTime: string;
  scheduledEndTime: string;
  createdAt: string;
}

class RecommendationService {
  async getRecommendations(jobId: string, maxResults: number = 10): Promise<RecommendationResponse> {
    return apiClient.get<RecommendationResponse>('/api/recommendations', {
      jobId,
      maxResults: maxResults.toString(),
    });
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<CreateAssignmentResponse> {
    return apiClient.post<CreateAssignmentResponse>('/api/assignments', data);
  }
}

export const recommendationService = new RecommendationService();

