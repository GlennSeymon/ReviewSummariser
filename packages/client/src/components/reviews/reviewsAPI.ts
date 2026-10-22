import axios from 'axios';

interface Review {
	id: number;
	author: string;
	content: string;
	rating: number;
	createdAt: string;
}

export interface GetReviewsResponse {
	reviewSummary: string | null;
	reviews: Review[];
}

export interface SummariseResponse {
	summary: string;
}

export const reviewsAPI = {
	getReviews(productId: number, signal: AbortSignal): Promise<GetReviewsResponse> {
		return axios
			.get<GetReviewsResponse>(`/api/products/${productId}/reviews`, {
				signal,
			})
			.then((res) => res.data);
	},

	summariseReviews(productId: number): Promise<SummariseResponse> {
		return axios
			.post<SummariseResponse>(`/api/products/${productId}/reviews/summarise`)
			.then((res) => res.data);
	},

	getErrorMessage(error: Error, fallback: string): string {
		if (axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error)
			return error.response.data.error;
		return fallback;
	},
};
