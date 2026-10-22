import OpenAi from 'openai';
import { InferenceClient } from '@huggingface/inference';
import { Ollama } from 'ollama';
import summarisePrompt from './prompts/summarise-reviews.txt';

const openAIClient = new OpenAi({
	apiKey: process.env.OPENAI_API_KEY,
});

const inferenceClient = new InferenceClient(process.env.HF_TOKEN);

const ollamaClient = new Ollama();

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
		const response = await ollamaClient.chat({
			model: 'tinyllama',
			messages: [
				{ role: 'system', content: summarisePrompt },
				{ role: 'user', content: text },
			],
		});

		return response.message.content;
	},
};
