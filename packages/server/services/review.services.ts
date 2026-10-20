import type { Review } from '../generated/prisma/client';
import { reviewRepository } from '../repositories/review.repository';
import OpenAi from 'openai';

const client = new OpenAi({
	apiKey: process.env.OPENAI_API_KEY,
});

export const reviewService = {
	async getReviews(productId: number): Promise<Review[]> {
		return reviewRepository.getReviews(productId);
	},

	async summariseReviews(productId: number): Promise<string> {
		const reviews = await reviewRepository.getReviews(productId, 10);
		const joinedReviews = reviews.map((r) => r.content).join('\n\n');
		const prompt = `Summarise the following customer reviews into a short paragraph highlighting key themes, both positive and negative: ${joinedReviews}`;

		const response = await client.responses.create({
			model: 'gpt-6-luna',
			input: prompt,
			max_output_tokens: 500,
		});

		return response.output_text;
	},
};
