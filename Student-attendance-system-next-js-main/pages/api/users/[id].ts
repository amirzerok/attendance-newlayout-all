import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

const API_URL = 'http://nestjs:3001/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const response = await axios.get(`${API_URL}/${id}`);
      return res.status(200).json(response.data);
    } else if (req.method === 'PUT') {
      const response = await axios.put(`${API_URL}/${id}`, req.body);
      return res.status(200).json(response.data);
    } else if (req.method === 'DELETE') {
      await axios.delete(`${API_URL}/${id}`);
      return res.status(204).end();
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("خطا در برقراری ارتباط با سرور:", error);

    // بررسی اینکه آیا خطا از نوع Axios است
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'خطا در برقراری ارتباط با سرور';
      return res.status(error.response?.status || 500).json({ message: errorMessage });
    } else {
      // برای خطاهای غیر Axios
      return res.status(500).json({ message: 'خطا غیر منتظره‌ای رخ داد.' });
    }
  }
}
