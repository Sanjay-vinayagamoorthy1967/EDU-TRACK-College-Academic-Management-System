import { Router } from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../controllers/courseController';
import { authenticate, authorize, checkCollegeLock } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN'), getCourses);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, createCourse);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, updateCourse);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), checkCollegeLock, deleteCourse);

export default router;
