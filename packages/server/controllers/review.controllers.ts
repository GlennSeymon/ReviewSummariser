import type { Request, Response } from 'express';
import { productRepository } from '../repositories/product.repository';
import { reviewRepository } from '../repositories/review.repository';
import { reviewService } from '../services/review.services';

export const reviewController = {
	async getReviews(req: Request, res: Response): Promise<void> {
		const productId = Number(req.params.id);
		if (!Number.isInteger(productId)) {
			res.status(400).json({ error: 'Invalid product ID' });
			return;
		}

		const product = await productRepository.getProduct(productId);
		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}

		try {
			const reviews = await reviewRepository.getReviews(productId);
			const reviewSummary = await reviewRepository.getReviewSummary(productId);

			res.json({ reviewSummary, reviews });
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

		const product = await productRepository.getProduct(productId);
		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}

		const reviews = await reviewRepository.getReviews(productId, 1);
		if (!reviews.length) {
			res.status(404).json({ error: 'There are no reviews to summarise' });
			return;
		}

		try {
			const summary = await reviewService.summariseReviews(productId);

			res.json({ summary });
		} catch (error) {
			console.error(`Failed to summarise reviews for product ${productId}:`, error);
			res.status(500).json({ error: 'Failed to fetch review summary' });
		}
	},
};
