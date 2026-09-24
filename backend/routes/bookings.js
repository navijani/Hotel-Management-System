import express from 'express';
const router = express.Router();

export default function(pool, bookingRateLimit) {
  // POST /api/bookings
  router.post('/', bookingRateLimit, async (req, res) => {
    try {
      const { firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate, roomType } = req.body;

      if ([firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate, roomType].some((value) => typeof value !== 'string' || !value.trim())) {
        return res.status(400).json({ error: 'All booking fields are required.' });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        let guestId;
        const [existingGuest] = await connection.query(
          'SELECT guest_id FROM GUEST WHERE identity_number = ?',
          [identificationNo]
        );

        if (existingGuest.length > 0) {
          guestId = existingGuest[0].guest_id;
        } else {
          const [guestResult] = await connection.query(
            'INSERT INTO GUEST (first_name, last_name, email, phone_number, identity_number) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, phone, identificationNo]
          );
          guestId = guestResult.insertId;
        }

        const [availableRooms] = await connection.query(
          'SELECT room_id FROM Room WHERE type = ? AND status = ? LIMIT 1',
          [roomType, 'Available']
        );
        if (availableRooms.length === 0) {
          const noRoomError = new Error('No room is available for the selected type.');
          noRoomError.statusCode = 409;
          throw noRoomError;
        }
        const roomId = availableRooms[0].room_id;

        const [bookingResult] = await connection.query(
          'INSERT INTO BOOKING (guest_id, room_id, check_in_date, check_out_date, booking_status) VALUES (?, ?, ?, ?, ?)',
          [guestId, roomId, checkInDate, checkOutDate, 'Booked']
        );

        await connection.commit();
        res.status(201).json({ message: 'Booking successful', bookingId: bookingResult.insertId });
      } catch (dbError) {
        await connection.rollback();
        throw dbError;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Booking error:', error);
      res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Failed to create booking' });
    }
  });

  return router;
}
