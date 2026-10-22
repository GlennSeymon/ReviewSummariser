import axios from 'axios';
import StarRating from './StarRating';
import Skeleton from 'react-loading-skeleton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { HiSparkles } from 'react-icons/hi2';

interface Props {
	productId: number;
}

interface Review {
	id: number;
	author: string;
	content: string;
	rating: number;
	createdAt: string;
}

interface GetReviewsResponse {
	reviewSummary: string | null;
	reviews: Review[];
}

interface SummariseResponse {
	summary: string;
}

const getReviews = async (productId: number, signal: AbortSignal): Promise<GetReviewsResponse> => {
	const { data } = await axios.get<GetReviewsResponse>(`/api/products/${productId}/reviews`, {
		signal,
	});
	return data;
};

const summariseReviews = async (productId: number): Promise<SummariseResponse> => {
	const { data } = await axios.post<SummariseResponse>(
		`/api/products/${productId}/reviews/summarise`
	);
	return data;
};

const getErrorMessage = (error: Error, fallback: string): string => {
	if (axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error)
		return error.response.data.error;
	return fallback;
};

const ReviewList = ({ productId }: Props) => {
	const queryClient = useQueryClient();

	const summaryMutation = useMutation<SummariseResponse>({
		mutationFn: () => summariseReviews(productId),
		onSuccess: ({ summary }) => {
			queryClient.setQueryData<GetReviewsResponse>(['reviews', productId], (old) =>
				old ? { ...old, reviewSummary: summary } : old
			);
		},
	});

	const reviewsQuery = useQuery({
		queryKey: ['reviews', productId],
		queryFn: ({ signal }) => getReviews(productId, signal),
	});

	if (reviewsQuery.isError)
		return (
			<p className='text-red-500'>
				Error: {getErrorMessage(reviewsQuery.error, 'Unable to load reviews')}
			</p>
		);

	if (!reviewsQuery.data?.reviews.length) return null;

	const currentSummary = reviewsQuery.data.reviewSummary || summaryMutation.data?.summary;

	return (
		<>
			<div className='mb-5'>
				{currentSummary ? (
					<p>{currentSummary}</p>
				) : (
					<>
						<Button
							onClick={() => summaryMutation.mutate()}
							className='cursor-pointer'
							disabled={summaryMutation.isPending}
						>
							<HiSparkles />
							Summarise
						</Button>
						{summaryMutation.isPending && (
							<div className='py-3'>
								<Skeleton width={500} count={3} />
							</div>
						)}
						{summaryMutation.isError && (
							<p className='text-red-500'>
								{getErrorMessage(summaryMutation.error, 'Could not summarise. Try again')}
							</p>
						)}
					</>
				)}
			</div>
			<div className='flex flex-col gap-5'>
				<table>
					<thead>
						<tr>
							<th>Author</th>
							<th>Rating</th>
							<th>Content</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{reviewsQuery.isLoading ? (
							[1, 2, 3].map((placeholder) => (
								<tr key={placeholder}>
									<td>
										<Skeleton width={120} />
									</td>
									<td>
										<Skeleton width={120} />
									</td>
									<td>
										<Skeleton count={2} />
									</td>
									<td>
										<Skeleton width={120} />
									</td>
								</tr>
							))
						) : !reviewsQuery.data?.reviews.length ? (
							<tr>
								<td colSpan={4}>No reviews yet</td>
							</tr>
						) : (
							reviewsQuery.data.reviews.map((review) => (
								<tr key={review.id}>
									<td>{review.author}</td>
									<td>
										<StarRating rating={review.rating} />
									</td>
									<td>{review.content}</td>
									<td>{new Date(review.createdAt).toLocaleDateString()}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default ReviewList;
