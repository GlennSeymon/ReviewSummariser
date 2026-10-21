import type { Review } from '../generated/prisma/client';
import { llmClient } from '../llm/client';
import template from '../prompts/review-summarise.txt';
import { reviewRepository } from '../repositories/review.repository';

export const reviewService = {
	async getReviews(productId: number): Promise<Review[]> {
		return reviewRepository.getReviews(productId);
	},

	async summariseReviews(productId: number): Promise<string> {
		const reviews = await reviewRepository.getReviews(productId, 10);
		const joinedReviews = reviews.map((r) => r.content).join('\n\n');
		const prompt = template.replace('{{reviews}}', joinedReviews);

		const { outputText: summary } = await llmClient.generateText({
			prompt,
			maxTokens: 500,
		});

		await reviewRepository.saveReviewSummary(productId, summary);

		return summary;
	},
};
