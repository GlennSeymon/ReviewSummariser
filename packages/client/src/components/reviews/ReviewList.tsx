import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { reviewsAPI, type GetReviewsResponse, type SummariseResponse } from './reviewsAPI';

interface Props {
	productId: number;
}

const ReviewList = ({ productId }: Props) => {
	const queryClient = useQueryClient();

	const summaryMutation = useMutation<SummariseResponse>({
		mutationFn: () => reviewsAPI.summariseReviews(productId),
		onSuccess: ({ summary }) => {
			queryClient.setQueryData<GetReviewsResponse>(['reviews', productId], (old) =>
				old ? { ...old, reviewSummary: summary } : old
			);
		},
	});

	const reviewsQuery = useQuery({
		queryKey: ['reviews', productId],
		queryFn: ({ signal }) => reviewsAPI.getReviews(productId, signal),
	});

	if (reviewsQuery.isError)
		return (
			<Alert severity='error'>
				{reviewsAPI.getErrorMessage(reviewsQuery.error, 'Unable to load reviews')}
			</Alert>
		);

	const reviews = reviewsQuery.data?.reviews ?? [];
	const currentSummary = reviewsQuery.data?.reviewSummary || summaryMutation.data?.summary;

	return (
		<Stack spacing={4}>
			<Box>
				<Typography variant='h5' component='h2'>
					Customer reviews
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					{reviewsQuery.isLoading
						? 'Loading reviews…'
						: `${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
				</Typography>
			</Box>

			{reviews.length > 0 && (
				<Card>
					<CardContent>
						<Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
							<AutoAwesome color='primary' fontSize='small' />
							<Typography variant='subtitle1'>AI summary</Typography>
						</Stack>
						{currentSummary ? (
							<Typography variant='body1' sx={{ lineHeight: 1.7 }}>
								{currentSummary}
							</Typography>
						) : (
							<Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
								<Typography variant='body2' color='text.secondary'>
									Generate a short summary of what customers are saying.
								</Typography>
								<Button
									variant='contained'
									startIcon={<AutoAwesome />}
									onClick={() => summaryMutation.mutate()}
									loading={summaryMutation.isPending}
									loadingPosition='start'
								>
									Summarise
								</Button>
								{summaryMutation.isPending && (
									<Box sx={{ width: '100%', maxWidth: 600 }}>
										<Skeleton />
										<Skeleton />
										<Skeleton width='60%' />
									</Box>
								)}
								{summaryMutation.isError && (
									<Alert severity='error' sx={{ width: '100%' }}>
										{reviewsAPI.getErrorMessage(
											summaryMutation.error,
											'Could not summarise. Try again'
										)}
									</Alert>
								)}
							</Stack>
						)}
					</CardContent>
				</Card>
			)}

			<TableContainer component={Paper} variant='outlined'>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Author</TableCell>
							<TableCell>Rating</TableCell>
							<TableCell>Review</TableCell>
							<TableCell align='right'>Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{reviewsQuery.isLoading ? (
							[1, 2, 3].map((placeholder) => (
								<TableRow key={placeholder}>
									<TableCell>
										<Skeleton width={100} />
									</TableCell>
									<TableCell>
										<Skeleton width={100} />
									</TableCell>
									<TableCell>
										<Skeleton />
										<Skeleton width='70%' />
									</TableCell>
									<TableCell align='right'>
										<Skeleton width={80} sx={{ ml: 'auto' }} />
									</TableCell>
								</TableRow>
							))
						) : !reviews.length ? (
							<TableRow>
								<TableCell
									colSpan={4}
									align='center'
									sx={{ py: 6, color: 'text.secondary' }}
								>
									No reviews yet
								</TableCell>
							</TableRow>
						) : (
							reviews.map((review) => (
								<TableRow key={review.id} hover>
									<TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
										{review.author}
									</TableCell>
									<TableCell>
										<Rating
											value={review.rating}
											readOnly
											size='small'
											aria-label={`${review.rating} out of 5 stars`}
										/>
									</TableCell>
									<TableCell sx={{ lineHeight: 1.6 }}>{review.content}</TableCell>
									<TableCell
										align='right'
										sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
									>
										{new Date(review.createdAt).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};

export default ReviewList;
