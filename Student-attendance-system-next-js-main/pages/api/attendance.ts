import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// MySQL connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || "mysql://root:@mysql:3306/test"
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create MySQL connection
    const connection = await mysql.createConnection(dbConfig.connectionString);

    // Query to get attendance records
    const [rows] = await connection.execute(
      'SELECT * FROM attendance ORDER BY checkin_time DESC'
    );

    // Close the connection
    await connection.end();

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
