import { Router } from 'express';
import { register, login, logout, me, refresh } from '../controllers/auth';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { RegisterSchema, LoginSchema } from '../schemas/auth';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);

export default router;
