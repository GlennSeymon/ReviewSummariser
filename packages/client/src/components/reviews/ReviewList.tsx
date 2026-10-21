import axios from 'axios';
import StarRating from './StarRating';
import Skeleton from 'react-loading-skeleton';
import { useQuery } from '@tanstack/react-query';

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
	const { data, isLoading, error } = useQuery({
		queryKey: ['reviews', productId],
		queryFn: ({ signal }) => getReviews(productId, signal),
	});

	if (error) return <p className='text-red-500'>Error: {getErrorMessage(error)}</p>;

	return (
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
	);
};

export default ReviewList;
