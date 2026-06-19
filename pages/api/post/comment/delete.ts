import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import connectDB from "@/lib/mongoDB/database/database";
import { ObjectId } from "mongodb";


export default async function handler (
   req: NextApiRequest, 
   res: NextApiResponse
) {
   if(req.method !== 'DELETE') {
      return res.status(405).json({message: '메서드 요청이 올바르지 않습니다.'})
   };

   const cmtId = req.query.cmt_id as string;
   const userId = req.query.user_id as string;
   const session = await getServerSession(req, res, authOptions);
   const db = (await connectDB).db('community');

   if (!session?.user?.id) {
      return res.status(401).json({
         message: '로그인이 필요합니다.'
      });
   }
   
   if(session?.user?.id !== userId) {
      return res.status(400).json({
         message: '댓글 작성자와 로그인한 사용자가 일치하지 않습니다.',
      });
   }

   if (
      typeof cmtId !== 'string' ||
      !ObjectId.isValid(cmtId)
   ) {
      return res.status(400).json({
         message: '잘못된 댓글 ID입니다.',
      });
   }

   const childCount = await db.collection('comments').countDocuments({
      parentCommentId: cmtId,
   })

   try {

      if(childCount === 0) {
         const result = await db.collection('comments').deleteOne(
            {_id: new ObjectId(cmtId),},
         )

         if(result.deletedCount === 0) {
            return res.status(400).json({
               message: '삭제할 게시글을 찾을 수 없습니다.',
            })
         }

         return res.status(200).json({
            message: '댓글 삭제 완료',
            deletedId: cmtId,
            type: 'deleted'
         })
         
      } else {
         const now = new Date();

         const result = await db.collection('comments').updateOne(
            {_id: new ObjectId(cmtId),},
            {
               $set: {
                  content: '삭제된 댓글입니다.',
                  isDeleted: true,
                  updatedAt: new Date(),
               }
            }
         )

         return res.status(200).json({
            message: '댓글 삭제 완료',
            type: 'softDeleted',
            comment: {
               _id: cmtId,
               content: '삭제된 댓글입니다.',
               isDeleted: true,
               updatedAt: now.toISOString(),
            }
         })
      }

      

   } catch(err) {
      console.error(err);

      return res.status(500).json({
         message: '삭제 에러'
      })
   }
}