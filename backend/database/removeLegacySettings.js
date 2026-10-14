// Safe to rerun: only the three retired settings columns are removed.
export async function removeLegacySettings(pool) {
  const retired = ['online_bookings_enabled', 'email_notifications_enabled', 'maintenance_mode'];
  const [columns] = await pool.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'system_settings'"
  );
  for (const name of retired) {
    if (columns.some((column) => column.COLUMN_NAME === name)) {
      await pool.query(`ALTER TABLE system_settings DROP COLUMN \`${name}\``);
    }
  }
}
