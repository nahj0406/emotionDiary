import connectDB from "@/lib/mongoDB/database/database";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";

// 유저 정보에 삭제 날짜 추가하고 상태도 삭제 대기로 바꾸고 30일 뒤에 이 유저 정보 삭제되도록 처리.


export default async function deleteAccountHandler (
   req: NextApiRequest,
   res: NextApiResponse
) {
   if(req.method !== 'POST') {
      return res.status(405).json({
         message: '요청 메서드가 올바르지 않습니다.'
      });
   }

   const session = await getServerSession(
      req,
      res,
      authOptions
   );

   if(!session?.user?.id) {
      return res.status(401).json({
         message: '로그인이 필요합니다',
      })
   }

   const client = await connectDB;
   const db = client.db('community');

   try {
      const result = await db.collection('user').updateOne(
         {_id: new ObjectId(session.user.id),},
         {
            $set: {
               status: 'withdrawn',
               deletedAt: new Date(),
               purgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
         }
      )

      if(result.matchedCount === 0) {
         return res.status(404).json({
            message: '사용자를 찾을 수 없습니다.'
         })
      }

      return res.status(200).json({
         message: '회원 탈퇴가 완료되었습니다.'
      })

   } catch(err) {
      console.error(err);
      return res.status(500).json({
         message: 'db에 유저정보를 업데이트 하는데 실패했습니다.'
      })
   }
}