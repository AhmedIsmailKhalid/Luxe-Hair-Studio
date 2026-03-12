import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookings.controller.js';

const router = Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id', updateBookingStatus);
router.delete('/:id', cancelBooking);

export default router;