import connectDB from "@/lib/mongoDB/database/database";
import { NextApiRequest, NextApiResponse } from "next";
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

   console.log('body:', req.body);

   const {data} = req.body;
   console.log('body:', req.body);

   const db = (await connectDB).db('community');

   try {
      // 비밀번호 암호화
      const hash = await bcrypt.hash(data.password, 10);

      const result = await db.collection('user').updateOne(
         {
            email: data.email,
         },
         {
            $set: {
               password: hash,
            }
         }
      )

      if(result.matchedCount === 0) {
         return res.status(404).json({
            message: '사용자를 찾을 수 없습니다.'
         });
      }

      return res.status(200).json({ok: true,})
   } catch(err) {
      console.error(err);
      return res.status(500).json({
         message: '이메일로 계정을 찾을 수 없습니다.'
      })
   }
}