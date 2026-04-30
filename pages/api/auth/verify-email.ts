import connectDB from '@/utils/database';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   const { email, code } = req.body;

   const db = (await connectDB).db('community');

   const record = await db.collection('email_verification').findOne({
      email,
      code
   });

   if(!record) {
      return res.status(400).json({meesage: '코드 불일치'});
   }

   try {
      await db.collection('email_verification').updateOne(
         {_id: record._id},
         { $set: {verified: true}}
      );

   } catch (err) {
      console.error('이메일 전송 에러', err);
      res.status(500).json({ message: '서버 에러' });
   }

   res.status(200).json({ ok: true });
}