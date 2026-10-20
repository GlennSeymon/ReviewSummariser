import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controllers';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
	res.send('Hello Worldy pants!');
});

router.get('/api/hello', (_req: Request, res: Response) => {
	res.json({ message: 'Hello World' });
});

router.post('/api/chat', async (req: Request, res: Response) => {
	return chatController.sendMessage(req, res);
});

export default router;
