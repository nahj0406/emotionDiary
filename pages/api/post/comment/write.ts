import connectDB from "@/lib/mongoDB/database/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { UserDB } from "@/types/interfaces";

// 댓글 내용, 유저 닉네임, 좋아요

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
   let parentId = null;
   let depth = 0;

   if(session?.user.id) {
      userInfo = await db.collection<UserDB>('user').findOne({
         _id: new ObjectId(session.user.id)
      })
   }

   if (req.body.parentId !== null && req.body.depth) {
      parentId = req.body.parentId;
      depth = req.body.depth + 1
   }

   try {
      const result = await db.collection('comments').insertOne({
         postId,
         nickName: userInfo?.nickName,
         content,
         parentId,
         createdAt: new Date(),
         depth,
      })

      return res.status(200).json({
         success: true,
      })

   } catch (err) {
      console.error(err);
      
      return res.status(500).json({
         success: false,
         message: '요청이 실패하였습니다.',
      });
   }




}