import express from 'express';
const router = express.Router();

export default function(pool, bookingRateLimit) {
  // POST /api/bookings
  router.post('/', bookingRateLimit, async (req, res) => {
    try {
      const { firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate, roomType, roomId } = req.body;

      if ([firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate].some((value) => typeof value !== 'string' || !value.trim())) {
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

        let assignedRoomId = roomId;

        if (!assignedRoomId) {
          if (!roomType) {
            throw { statusCode: 400, message: 'roomType or roomId must be provided.' };
          }
          const [availableRooms] = await connection.query(
            `SELECT room_id FROM Room r 
             WHERE type = ? 
             AND NOT EXISTS (
                SELECT 1 FROM BOOKING b 
                WHERE b.room_id = r.room_id 
                AND b.booking_status IN ('Booked', 'Checked-In')
                AND (b.check_in_date < ? AND b.check_out_date > ?)
             ) LIMIT 1`,
            [roomType, checkOutDate, checkInDate]
          );
          if (availableRooms.length === 0) {
            throw { statusCode: 409, message: 'No room is available for the selected dates.' };
          }
          assignedRoomId = availableRooms[0].room_id;
        } else {
          // Verify the specific room is not already booked for these dates
          const [overlap] = await connection.query(
            `SELECT 1 FROM BOOKING 
             WHERE room_id = ? 
             AND booking_status IN ('Booked', 'Checked-In')
             AND (check_in_date < ? AND check_out_date > ?) LIMIT 1`,
             [assignedRoomId, checkOutDate, checkInDate]
          );
          if (overlap.length > 0) {
            throw { statusCode: 409, message: 'This room is already booked for the selected dates.' };
          }
        }

        const [bookingResult] = await connection.query(
          'INSERT INTO BOOKING (guest_id, room_id, check_in_date, check_out_date, booking_status) VALUES (?, ?, ?, ?, ?)',
          [guestId, assignedRoomId, checkInDate, checkOutDate, 'Booked']
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

  // GET /api/bookings (Fetch all bookings)
  router.get('/', async (req, res) => {
    try {
      const [bookings] = await pool.query(
        `SELECT b.booking_id, g.first_name, g.last_name, g.email, g.phone_number, g.identity_number, 
                r.room_number, rt.type_name as room_type, rt.daily_rate as price_per_night, 
                b.check_in_date, b.check_out_date, b.booking_status 
         FROM BOOKING b
         LEFT JOIN GUEST g ON b.guest_id = g.guest_id
         LEFT JOIN Room r ON b.room_id = r.room_id
         LEFT JOIN RoomType rt ON r.room_type_id = rt.room_type_id
         ORDER BY b.booking_id DESC`
      );
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // PUT /api/bookings/:id/status
  router.put('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      await pool.query('UPDATE BOOKING SET booking_status = ? WHERE booking_id = ?', [status, req.params.id]);
      
      // If status is Checked-Out or Cancelled, maybe we want to free the room if it was previously occupied, 
      // but status in Room table is usually independent (handled manually or by daily cron).
      // We will just update booking_status for now.

      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // GET /api/bookings/room/:id/dates
  router.get('/room/:id/dates', async (req, res) => {
    try {
      const roomId = req.params.id;
      const [bookings] = await pool.query(
        `SELECT check_in_date, check_out_date FROM BOOKING 
         WHERE room_id = ? AND booking_status IN ('Booked', 'Checked-In')`,
        [roomId]
      );
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      res.status(500).json({ error: 'Failed to fetch booked dates' });
    }
  });

  return router;
}
