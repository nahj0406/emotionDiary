import connectDB from "@/lib/mongoDB/database/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export default async function handler (
   req: NextApiRequest,
   res: NextApiResponse
) {
   if(req.method !== 'POST') {
      return res.status(405).json({
         message: '메서드가 올바르지 않습니다.'
      })
   }

   const {code} = req.body;

   const db = (await connectDB).db('community');
   
   const session = await getServerSession(
      req,
      res,
      authOptions
   );

   if(!session?.user.id) {
      return res.status(401).json({
         message: '로그인이 필요합니다.'
      })
   }

   try {
      const result = await db.collection('user').findOne({
         _id: new ObjectId(session.user.id),
      })

      if(!result) {
         return res.status(404).json({
            message: '사용자를 찾을 수 없습니다.',
         })
      }

      const isValid = await bcrypt.compare(
         code as string,
         result.password
      )

      if(!isValid) {
         return res.status(401).json({
            message: '비밀번호가 일치하지 않습니다.'
         });
      }

      return res.status(200).json({
         success: true,
      });

   } catch (err) {
      console.error(err);
      return res.status(500).json({
         message: '조회 실패'
      })
   }
}