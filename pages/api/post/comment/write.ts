import connectDB from "@/lib/mongoDB/database/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { UserDB } from "@/types/interfaces";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

   if(req.method !== 'POST') {
      return res.status(405).json({message: '메서드 요청이 올바르지 않습니다.'})
   };

   if (!req.body.content) {
      return res.status(400).json({message: '댓글 내용을 입력해 주세요.'})
   } else if (!req.body.postId) {
      return res.status(400).json({message: '게시물을 찾을 수 없습니다.'})
   }

   const content = req.body.content;
   let userInfo = null;
   const postId = req.body.postId;
   const db = (await connectDB).db('community');
   const session = await getServerSession(req, res, authOptions);
   const parentCommentId = req.body.parentId ?? null;
   const depth = req.body.depth;

   if (!session?.user?.id) {
      return res.status(401).json({
         message: '로그인이 필요합니다.'
      });
   }

   if(session?.user.id) {
      userInfo = await db.collection<UserDB>('user').findOne({
         _id: new ObjectId(session.user.id)
      })
   }

   const now = new Date();

   try {
      const result = await db.collection('comments').insertOne({
         postId,
         user: {
            id: userInfo?._id,
            nickName: userInfo?.nickName,
         },
         content,
         parentCommentId: parentCommentId,
         createdAt: new Date(),
         depth,
      })

      return res.status(200).json({
         success: true,
         comment: {
            _id: result.insertedId.toString(),
            postId,
            user: {
               id: session.user.id,
               nickName: userInfo?.nickName,
            },
            content,
            parentCommentId,
            depth,
            createdAt: now.toISOString(),
         }
      })

   } catch (err) {
      console.error(err);
      
      return res.status(500).json({
         success: false,
         message: '요청이 실패하였습니다.',
      });
   }




}