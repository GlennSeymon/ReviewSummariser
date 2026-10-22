import OpenAi from 'openai';
import { InferenceClient } from '@huggingface/inference';

const openAIClient = new OpenAi({
	apiKey: process.env.OPENAI_API_KEY,
});

const inferenceClient = new InferenceClient(process.env.HF_TOKEN);

interface GenerateTextOptions {
	model?: string;
	prompt: string;
	maxTokens?: number;
	instructions?: string;
	previousResponseId?: string;
}

export interface GenerateTextResult {
	id: string;
	outputText: string;
}

export const llmClient = {
	async generateText({
		model = 'gpt-6-luna',
		prompt,
		maxTokens = 300,
		instructions,
		previousResponseId,
	}: GenerateTextOptions): Promise<GenerateTextResult> {
		const response = await openAIClient.responses.create({
			model,
			input: prompt,
			max_output_tokens: maxTokens,
			instructions,
			previous_response_id: previousResponseId,
		});

		return { id: response.id, outputText: response.output_text };
	},

	async summarise(text: string) {
		const output = await inferenceClient.summarization({
			model: 'facebook/bart-large-cnn',
			inputs: text,
			provider: 'hf-inference',
		});

		return output.summary_text;
	},
};
