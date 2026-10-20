import type { Request, Response } from 'express';
import { reviewService } from '../services/review.services';

export const reviewController = {
	async getReviews(req: Request, res: Response): Promise<void> {
		const productId = Number(req.params.id);
		if (!Number.isInteger(productId)) {
			res.status(400).json({ error: 'Invalid product ID' });
			return;
		}

		try {
			const reviews = await reviewService.getReviews(productId);

			res.json(reviews);
		} catch (error) {
			res.status(500).json({ error: 'Failed to fetch reviews' });
		}
	},

	async summariseReviews(req: Request, res: Response): Promise<void> {
		const productId = Number(req.params.id);
		if (!Number.isInteger(productId)) {
			res.status(400).json({ error: 'Invalid product ID' });
			return;
		}

		try {
			const summary = await reviewService.summariseReviews(productId);

			res.json({ summary });
		} catch (error) {
			res.status(500).json({ error: 'Failed to fetch review summary' });
		}
	},
};
