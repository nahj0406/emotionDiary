import connectDB from '@/lib/mongoDB/database/database';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
   req: NextApiRequest, 
   res: NextApiResponse
) {
   if(req.method !== 'GET') {
      return res.status(405).json({
         message: '메서드가 허용되지 않았습니다.'
      })
   }

   try {
      const client = await connectDB;
      const db = client.db("community");
      const postId = req.query.postId;

      if(typeof postId !== 'string') {
         return res.status(400).json({
            error: '잘못된 postId',
         })
      }

      const result = await db.collection('post').findOneAndUpdate(
         {_id: new ObjectId(postId)},
         {
            $inc: {
               views: 1
            }
         }
      )

      return res.status(200).json({
         message: '조회수 증가 완료',
      })

   } catch(err) {
      if (err instanceof Error) {
         console.error(err.message);
      }

      return res.status(500).json({
         error: '조회수 갱신 실패'
      });
   }
}