import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import RateReviewOutlined from '@mui/icons-material/RateReviewOutlined';
import ColorModeToggle from './components/ColorModeToggle';
import ProductSelect from './components/products/ProductSelect';
import { productsAPI } from './components/products/productsAPI';
import ReviewList from './components/reviews/ReviewList';
import { reviewsAPI } from './components/reviews/reviewsAPI';

function App() {
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

	const productsQuery = useQuery({
		queryKey: ['products'],
		queryFn: ({ signal }) => productsAPI.getProducts(signal),
	});

	// Default to the first product until the user picks one
	const productId = selectedProductId ?? productsQuery.data?.[0]?.id ?? null;

	return (
		<Box sx={{ minHeight: '100vh' }}>
			<AppBar position='sticky'>
				<Toolbar>
					<RateReviewOutlined color='primary' sx={{ mr: 1.5 }} />
					<Typography variant='h6' component='h1' sx={{ flexGrow: 1 }}>
						Review Summariser
					</Typography>
					<ColorModeToggle />
				</Toolbar>
			</AppBar>
			<Container maxWidth='lg' sx={{ py: { xs: 3, md: 5 } }}>
				<Stack spacing={4}>
					{productsQuery.isError ? (
						<Alert severity='error'>
							{reviewsAPI.getErrorMessage(productsQuery.error, 'Unable to load products')}
						</Alert>
					) : (
						<ProductSelect
							products={productsQuery.data}
							value={productId}
							onChange={setSelectedProductId}
						/>
					)}
					{productsQuery.data?.length === 0 && (
						<Alert severity='info'>There are no products yet.</Alert>
					)}
					{/* key resets the summarise mutation state when the product changes */}
					{productId !== null && <ReviewList key={productId} productId={productId} />}
				</Stack>
			</Container>
		</Box>
	);
}

export default App;
