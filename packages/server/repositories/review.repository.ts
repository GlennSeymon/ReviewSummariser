import type { Review } from '../generated/prisma/client';
import { prisma } from './prisma';

export const reviewRepository = {
	getReviews(productId: number, limit?: number): Promise<Review[]> {
		return prisma.review.findMany({
			where: { productId },
			orderBy: { createdAt: 'desc' },
			take: limit,
		});
	},
};
