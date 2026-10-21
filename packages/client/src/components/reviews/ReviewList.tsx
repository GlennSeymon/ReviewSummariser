import axios from 'axios';
import StarRating from './StarRating';
import Skeleton from 'react-loading-skeleton';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { HiSparkles } from 'react-icons/hi2';
import { useState } from 'react';

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

const getErrorMessage = (error: Error): string => {
	if (axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error)
		return error.response.data.error;
	return 'Unable to load reviews';
};

const ReviewList = ({ productId }: Props) => {
	const [summary, setSummary] = useState('');
	const [isSummaryLoading, setIsSummaryLoading] = useState(false);
	const { data, isLoading, error } = useQuery({
		queryKey: ['reviews', productId],
		queryFn: ({ signal }) => getReviews(productId, signal),
	});

	const handleSummarise = async () => {
		setIsSummaryLoading(true);

		const { data } = await axios.post<SummariseResponse>(
			`/api/products/${productId}/reviews/summarise`
		);

		setSummary(data.summary);
		setIsSummaryLoading(false);
	};

	if (error) return <p className='text-red-500'>Error: {getErrorMessage(error)}</p>;

	if (!data?.reviews.length) return null;

	const currentSummary = data.reviewSummary || summary;

	return (
		<>
			<div className='mb-5'>
				{currentSummary ? (
					<p>{currentSummary}</p>
				) : (
					<>
						<Button
							onClick={handleSummarise}
							className='cursor-pointer'
							disabled={isSummaryLoading}
						>
							<HiSparkles />
							Summarise
						</Button>
						{isSummaryLoading && (
							<div className='py-3'>
								<Skeleton width={500} count={3} />
							</div>
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
						{isLoading ? (
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
						) : !data?.reviews.length ? (
							<tr>
								<td colSpan={4}>No reviews yet</td>
							</tr>
						) : (
							data.reviews.map((review) => (
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
