import connectDB from "@/utils/database";
import { ROLE } from "@/utils/exports";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const { nickname, name, email, password } = req.body;

      if (!nickname || !name || !email || !password) {
        return res.status(400).json("필수 내용이 입력되지 않았습니다.");
      }

      const db = (await connectDB).db("community");

      // 메일 인증 확인 조회
      const verified = await db.collection("email_verification").findOne({
        email,
        verified: true,
      });

      if (!verified) {
        return res.status(400).json({
          message: "이메일 인증이 필요합니다.",
        });
      }

      // 메일 중복 확인
      const existing = await db.collection("user_cred").findOne({ email });
      if (existing) {
         return res.status(400).json({
           message: "이미 가입된 이메일입니다.",
         });
      }
      
      // 비밀번호 암호화
      const hash = await bcrypt.hash(req.body.password, 10);

      // 최종 데이터 송신
      await db.collection("user_cred").insertOne({
         nickname,
         name,
         email,
         password: hash,
         emailVerified: true,
         createdAt: new Date(),
         role: ROLE.USER,
      });

      // 인증완료된 메일의 인증 삭제
      await db.collection("email_verification").deleteOne({ email });

      return res.status(200).json("회원가입이 완료되었습니다.");
    } catch (err) {
      console.log(err);
      return res.status(500).json("서버 에러");
    }
  } else {
    return res.status(405).end();
  }
}
