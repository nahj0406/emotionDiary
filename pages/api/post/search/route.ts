import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from "@/lib/mongoDB/database/database";
import { mergePosts } from "@/lib/mongoDB/mergePosts";
import { PostDTO } from "@/types/interfaces";

export default async function handler(
   req: NextApiRequest, 
   res: NextApiResponse
) {
   if(req.method !== 'GET') {
      return res.status(405).json({
         message: '메서드가 허용되지 않았습니다.'
      })
   }

   const keyword = req.query.q as string;

   try {
      const client = await connectDB;
      const db = client.db("community");

      const search_List = await db.collection<PostDTO>('post').find({
         $or: [
            {title: {$regex: keyword, $options: 'i'}},
            {'books.bookTitle': {$regex: keyword, $options: 'i'}},
            {'books.bookAuthor': {$regex: keyword, $options: 'i'}},
            {'books.bookPublisher': {$regex: keyword, $options: 'i'}},
            {content: {$regex: keyword, $options: 'i'}}
         ]
      }).sort({ createdAt: -1 }).toArray();

      const result = await mergePosts(search_List);

      return res.status(200).json(result);

   } catch (err) {
      if (err instanceof Error) {
         console.error(err.message);
      }

      return res.status(500).json({
         error: '조회 실패'
      });
   }
}