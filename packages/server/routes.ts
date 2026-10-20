import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controllers';
import { reviewController } from './controllers/review.controllers';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
	res.send('Hello Worldy pants!');
});

router.get('/api/hello', (_req: Request, res: Response) => {
	res.json({ message: 'Hello World' });
});

router.post('/api/chat', chatController.sendMessage);
router.get('/api/products/:id/reviews', reviewController.getReviews);
router.post('/api/products/:id/reviews/summarise', reviewController.summariseReviews);

export default router;
