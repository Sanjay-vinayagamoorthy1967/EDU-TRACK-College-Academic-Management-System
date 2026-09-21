import { Router } from 'express';
import { publishResult, getStudentResults, unpublishResult, deleteResult } from '../controllers/resultController';
import { authenticate, authorize, checkCollegeLock } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/publish', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), checkCollegeLock, publishResult);
router.get('/student/:studentId', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'), getStudentResults);
router.put('/:id/unpublish', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, unpublishResult);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, deleteResult);

export default router;
