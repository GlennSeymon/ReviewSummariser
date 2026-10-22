import { llmClient } from '../llm/client';
import template from '../prompts/review-summarise.txt';
import { reviewRepository } from '../repositories/review.repository';

export const reviewService = {
	async summariseReviews(productId: number): Promise<string> {
		const existingSummary = await reviewRepository.getReviewSummary(productId);
		if (existingSummary) return existingSummary;

		const reviews = await reviewRepository.getReviews(productId, 10);
		const joinedReviews = reviews.map((r) => r.content).join('\n\n');
		const prompt = template.replace('{{reviews}}', joinedReviews);
		const summary = await llmClient.summarise(joinedReviews);

		await reviewRepository.saveReviewSummary(productId, summary);

		return summary;
	},
};
