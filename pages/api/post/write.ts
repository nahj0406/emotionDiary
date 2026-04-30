import connectDB from "@/utils/database";
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler (req: NextApiRequest, res: NextApiResponse) {
   if(req.method === 'POST') {
      if(req.body.title == '' || req.body.content == '')
         return res.status(500).json('필수 내용이 입력되지 않았습니다.');

      try {
         const db = (await connectDB).db('community');
         const result = await db.collection('post').insertOne(req.body);

         return res.status(200).redirect(302, '/list');

      } catch (error) {
         return res.status(500).json('요청이 실패하였습니다.');
      }
   }
}