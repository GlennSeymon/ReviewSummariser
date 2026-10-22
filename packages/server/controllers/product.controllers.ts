import type { Request, Response } from 'express';
import { productRepository } from '../repositories/product.repository';

export const productController = {
	async getProducts(_req: Request, res: Response): Promise<void> {
		try {
			const products = await productRepository.getProducts();

			res.json(products);
		} catch (error) {
			console.error('Failed to fetch products:', error);
			res.status(500).json({ error: 'Failed to fetch products' });
		}
	},
};
