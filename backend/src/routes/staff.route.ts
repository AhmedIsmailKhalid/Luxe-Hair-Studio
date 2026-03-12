import { Router } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  upsertAvailability,
  updateStaffServices,
} from '../controllers/staff.controller.js';

const router = Router();

router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.post('/', createStaff);
router.patch('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.post('/:id/availability', upsertAvailability);
router.post('/:id/services', updateStaffServices);


export default router;