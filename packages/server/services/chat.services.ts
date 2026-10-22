import fs from 'fs';
import path from 'path';
import OpenAi from 'openai';
import { conversationRepository } from '../repositories/conversation.repository';
import template from '../llm/prompts/chatbot.txt';
import { llmClient } from '../llm/client';

interface ChatResponse {
	id: string;
	message: string;
}

const client = new OpenAi({
	apiKey: process.env.OPENAI_API_KEY,
});

const parkInfo = fs.readFileSync(
	path.join(__dirname, '..', 'llm', 'prompts', 'WonderWorld.md'),
	'utf-8'
);
const instructions = template.replace('{{parkInfo}}', parkInfo);

export const chatService = {
	async sendMessage(prompt: string, conversationId: string): Promise<ChatResponse> {
		const response = await llmClient.generateText({
			model: 'gpt-6-luna',
			instructions,
			prompt,
			maxTokens: 200,
			previousResponseId: conversationRepository.getLastResponseId(conversationId),
		});

		conversationRepository.setLastResponseId(conversationId, response.id);

		return { id: response.id, message: response.outputText };
	},
};
