import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import connectDB from "@/lib/mongoDB/database/database";
import { ObjectId } from "mongodb";


export default async function handler (
   req: NextApiRequest, 
   res: NextApiResponse
) {
   if(req.method !== 'PUT') {
      return res.status(405).json({message: '메서드 요청이 올바르지 않습니다.'})
   };

   const cmtId = req.body.cmt_id;
   const userId = req.body.user_id;
   const postId = req.body.post_id;
   const content = req.body.content;
   const session = await getServerSession(req, res, authOptions);
   const db = (await connectDB).db('community');

   if (!session?.user?.id) {
      return res.status(401).json({
         message: '로그인이 필요합니다.'
      });
   }

   if (!content) {
      return res.status(400).json({message: '댓글 내용을 입력해 주세요.'})
   } else if (!postId) {
      return res.status(400).json({message: '게시물을 찾을 수 없습니다.'})
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

   try {

      const now = new Date();

      await db.collection('comments').updateOne(
         {_id: new ObjectId(cmtId),},
         {
            $set: {
               content: content,
               updatedAt: new Date(),
            }
         }
      )

      return res.status(200).json({
         message: '댓글 수정 완료',
         type: 'softDeleted',
         comment: {
            _id: cmtId,
            content,
            updatedAt: now.toISOString(),
         }
      })

   } catch(err) {
      console.error(err);

      return res.status(500).json({
         message: '수정 에러'
      })
   }
}