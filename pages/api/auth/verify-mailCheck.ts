import connectDB from '@/lib/mongoDB/database';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

   try {
      const { email, code } = req.body;
      const db = (await connectDB).db('community');

      const record = await db.collection('email_verification').findOne({
         email,
         code,
      });

      if(!record) { // 코드 불일치
         throw new Error('INCORRECT_CODE');
      }

      if (new Date() > new Date(record.expiresAt)) { // 시간 만료
         throw new Error('EXPIRATION_CODE');
      }

      await db.collection('email_verification').updateOne(
         {_id: record._id},
         { $set: {verified: true}}
      );

   } catch (err) {
      console.error('이메일 전송 에러', err);
      if (err instanceof Error) {

         return res.status(400).json({
            message: err.message
         });
      }

      // 예상 못한 에러
      return res.status(500).json({
         message: 'SERVER_ERROR'
      });
   }

   res.status(200).json({ ok: true });
}