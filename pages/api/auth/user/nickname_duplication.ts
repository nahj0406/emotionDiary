import connectDB from "@/lib/mongoDB/database";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   try {
      const db = (await connectDB).db('community');
      const {nickname} = req.query;

      if (typeof nickname !== 'string') {
         return res.status(400).json({
            message: '올바른 닉네임 값이 아닙니다.'
         })
      }

      const result = await db.collection('user_cred').findOne({
         nickname: nickname
      });

      if (!result) {
         return res.status(200).json({
            available: true,
            message: '사용 가능한 닉네임입니다.'
         });
      }

      // 중복 있음
      return res.status(200).json({
         available: false,
         message: '중복된 닉네임입니다.'
      });

   } catch(err) {
      console.error('닉네임 값이 올바르지 않음', err);
      if(err instanceof Error) {
         return res.status(400).json({
            message: err.message
         });
      }

      return res.status(500).json({
         message: 'SERVER_ERROR'
      })
   }
}