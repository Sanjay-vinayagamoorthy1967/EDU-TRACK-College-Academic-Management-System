import { Router } from 'express';
import { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN'), getAdmins);
router.post('/', authorize('SUPER_ADMIN'), createAdmin);
router.get('/:id', authorize('SUPER_ADMIN'), getAdminById);
router.put('/:id', authorize('SUPER_ADMIN'), updateAdmin);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteAdmin);

export default router;
