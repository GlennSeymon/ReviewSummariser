import OpenAi from 'openai';

const client = new OpenAi({
	apiKey: process.env.OPENAI_API_KEY,
});

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
		const response = await client.responses.create({
			model,
			input: prompt,
			max_output_tokens: maxTokens,
			instructions,
			previous_response_id: previousResponseId,
		});

		return { id: response.id, outputText: response.output_text };
	},
};
