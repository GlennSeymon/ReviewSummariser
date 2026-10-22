import type { Product } from '../generated/prisma/client';
import { prisma } from './prisma';

export const productRepository = {
	getProducts(): Promise<Pick<Product, 'id' | 'name'>[]> {
		return prisma.product.findMany({
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		});
	},

	getProduct(productId: number): Promise<Product | null> {
		return prisma.product.findUnique({
			where: { id: productId },
		});
	},
};
