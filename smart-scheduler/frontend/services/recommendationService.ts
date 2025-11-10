import Constants from 'expo-constants';
import { Job, JobType, BaseLocation } from './jobService';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getRecommendations(jobId: string, maxResults: number = 10): Promise<RecommendationResponse> {
    const response = await fetch(`${this.baseUrl}/api/recommendations?jobId=${jobId}&maxResults=${maxResults}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to get recommendations');
    }
    return response.json();
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<CreateAssignmentResponse> {
    const response = await fetch(`${this.baseUrl}/api/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to create assignment');
    }

    return response.json();
  }
}

export const recommendationService = new RecommendationService();

