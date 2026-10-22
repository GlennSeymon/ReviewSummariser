import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import type { Product } from './productsAPI';

interface Props {
	products: Product[] | undefined;
	value: number | null;
	onChange: (productId: number) => void;
}

const ProductSelect = ({ products, value, onChange }: Props) => {
	if (!products) return <Skeleton variant='rounded' width={440} height={56} />;

	return (
		<FormControl sx={{ width: { xs: '100%', sm: 440 } }} disabled={!products.length}>
			<InputLabel id='product-select-label'>Product</InputLabel>
			<Select
				labelId='product-select-label'
				label='Product'
				value={value ?? ''}
				onChange={(e) => onChange(Number(e.target.value))}
			>
				{products.map((product) => (
					<MenuItem key={product.id} value={product.id}>
						{product.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default ProductSelect;
