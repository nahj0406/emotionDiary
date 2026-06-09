import connectDB from "@/lib/mongoDB/database/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";


export default async function DELETE (req: NextApiRequest, res: NextApiResponse) {

   if(req.method !== 'DELETE') {
      return res.status(401).json({message: '메서드가 일치하지 않습니다.'})
   }

   const { post } = req.query;
   const postData = JSON.parse(post as string);

   const session = await getServerSession(
      req,
      res,
      authOptions
   );

   if(postData.userId !== session?.user.id) {
      return res.status(400).json({
         message: '게시글 작성자 본인이 아닙니다.'
      })
   }

   const db = (await connectDB).db('community');

   try {
      const result = await db.collection('post').deleteOne({
         _id: new ObjectId(postData._id),
      });

      if(result.deletedCount === 0) {
         return res.status(400).json({
            message: '삭제할 게시글을 찾을 수 없습니다.',
         })
      }

      return res.status(200).json({
         message: '삭제 완료',
      })

   } catch (err) {
      console.error(err);

      return res.status(500).json({
         message: '삭제 에러'
      })
   }
}