import axios from 'axios';
import { useEffect, useState } from 'react';

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

const ReviewList = ({ productId }: Props) => {
	const [reviews, setReviews] = useState<GetReviewsResponse>();
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();

		const getReviews = async (): Promise<void> => {
			try {
				const { data } = await axios.get<GetReviewsResponse>(
					`/api/products/${productId}/reviews`,
					{ signal: controller.signal }
				);

				setReviews(data);
			} catch (error) {
				if (axios.isCancel(error)) return;
				setError('Unable to get reviews');
			} finally {
				setIsLoading(false);
			}
		};

		getReviews();
		return () => controller.abort();
	}, [productId]);

	if (isLoading) return <p>Loading.....</p>;
	if (error) return <p>Error: {error}</p>;

	console.log('Reviews', reviews);
	return (
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
				{reviews?.reviews.map((review) => (
					<tr key={review.id}>
						<td>{review.author}</td>
						<td>{review.rating}</td>
						<td>{review.content}</td>
						<td>{review.createdAt}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default ReviewList;
