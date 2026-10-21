import dayjs from 'dayjs';
import type { Review, Summary } from '../generated/prisma/client';
import { prisma } from './prisma';

export const reviewRepository = {
	getReviews(productId: number, limit?: number): Promise<Review[]> {
		return prisma.review.findMany({
			where: { productId },
			orderBy: { createdAt: 'desc' },
			take: limit,
		});
	},

	saveReviewSummary(productId: number, summary: string): Promise<Summary> {
		const now = new Date();
		const expiresAt = dayjs().add(7, 'days').toDate();
		const data = { content: summary, expiresAt, generatedAt: now, productId };

		return prisma.summary.upsert({
			where: { productId },
			create: data,
			update: data,
		});
	},
};
