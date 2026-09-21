import { Router } from 'express';
import { getFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty } from '../controllers/facultyController';
import { authenticate, authorize, checkCollegeLock } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN'), getFaculty);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, createFaculty);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), getFacultyById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, updateFaculty);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, deleteFaculty);

export default router;
