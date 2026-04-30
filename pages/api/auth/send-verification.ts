import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/utils/database';
import { Resend } from "resend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { email } = body;
      // const { email } = 'nahj0406@naver.com';

      const db = (await connectDB).db('community');

      // ✅ 1. 먼저 중복 체크
      const existing = await db.collection('user_cred').findOne({ email });
      if (existing) {
         return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // ✅ 2. 인증코드 저장
      await db.collection('email_verification').deleteMany({ email });

      await db.collection('email_verification').insertOne({
         email,
         code,
         verified: false,
         createdAt: new Date(),
      });

      const resend = new Resend(process.env.RESEND_API_KEY);

      // ✅ 3. 메일 전송
      const result = await resend.emails.send({
         from: 'onboarding@resend.dev',
         to: 'nahj6953@gmail.com',
         // to: email, 도메인 인증하면 이걸로 바꾸기
         subject: '이메일 인증 코드',
         html: `<h1>${code}</h1>`
      });

      console.log('resend result:', result);

      res.status(200).json({ ok: true });

   } catch (err) {
      console.error('이메일 전송 에러', err);
      res.status(500).json({ message: '서버 에러' });
   }
}