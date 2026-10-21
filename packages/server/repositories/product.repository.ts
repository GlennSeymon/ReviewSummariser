import type { Product } from '../generated/prisma/client';
import { prisma } from './prisma';

export const productRepository = {
	getProduct(productId: number): Promise<Product | null> {
		return prisma.product.findUnique({
			where: { id: productId },
		});
	},
};
