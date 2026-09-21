import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile } from '../controllers/studentController';
import { authenticate, authorize, checkCollegeLock } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('STUDENT'), getMyProfile);
router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), getStudents);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), checkCollegeLock, createStudent);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'), getStudent);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), checkCollegeLock, updateStudent);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, deleteStudent);

export default router;
