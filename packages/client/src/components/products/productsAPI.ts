import axios from 'axios';

export interface Product {
	id: number;
	name: string;
}

export const productsAPI = {
	getProducts(signal: AbortSignal): Promise<Product[]> {
		return axios.get<Product[]>('/api/products', { signal }).then((res) => res.data);
	},
};
