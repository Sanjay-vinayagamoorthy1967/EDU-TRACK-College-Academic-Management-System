import { Router } from 'express';
import { getColleges, getCollege, createCollege, updateCollege, deleteCollege, toggleCollegeLock } from '../controllers/collegeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getColleges);
router.post('/', authorize('SUPER_ADMIN'), createCollege);
router.get('/:id', getCollege);
router.put('/:id', authorize('SUPER_ADMIN'), updateCollege);
router.put('/:id/lock', authorize('SUPER_ADMIN'), toggleCollegeLock);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteCollege);

export default router;
