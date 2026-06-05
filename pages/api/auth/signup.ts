import { BAD_WORDS, customWords } from "@/lib/badWords/badWords";
import connectDB from "@/lib/mongoDB/database/database";
import { ROLE } from "@/utils/exports";
import { normalize } from "@/utils/functions";
import { signupVal } from "@/utils/validations/signup/infoValidation";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const { nickName, name, tags, email, password } = req.body;

      if (!nickName || !name || !tags || !email || !password) {
        return res.status(400).json({
         message: "필수 내용이 입력되지 않았습니다."
        });
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
      const existing = await db.collection("user").findOne({ email });
      if (existing) {
         return res.status(400).json({
           message: "이미 가입된 이메일입니다.",
         });
      }

      // 닉네임 중복 체크
      const nickCheck = await db.collection('user').findOne({nickName: nickName});
      if(nickCheck) {
         return res.status(400).json({
            message: '중복된 닉네임은 사용할 수 없습니다.'
         })
      }

      // 이름, 닉네임 작성길이 체크
      const nameLengthErr =
         name.length < signupVal.name.min ||
         name.length > signupVal.name.max;

      const nicknameLengthErr =
         name.length < signupVal.nickName.min ||
         name.length > signupVal.nickName.max;

      const passwordLengthErr =
         password.length < signupVal.pw.min ||
         password.length > signupVal.pw.max;

      if(nameLengthErr || nicknameLengthErr) {
         return res.status(400).json({
            message: '이름, 닉네임의 최소, 최대 작성 길이를 지켜주세요.'
         })
      }

      if(passwordLengthErr) {
         return res.status(400).json({
            message: '비밀번호의 최소, 최대 길이를 지켜주세요.'
         })
      }

      if(!Array.isArray(tags)) {
         return res.status(400).json({
            message: '성향 태그가 배열 타입이 아닙니다. \n 배열 타입으로 수정해 주세요.'
         })
      }

      if(tags.length === 0 || tags.length > 3) {
         return res.status(400).json({
            message: '성향은 최소 1개, 최대 3개를 넘기면 안됩니다.'
         })
      }

      const numberTxtCheck = (text: string) => {
         const isOnlyNumber = /^\d+$/.test(text);
         return isOnlyNumber
      }

      const numberName = numberTxtCheck(name);
      const numberNick = numberTxtCheck(nickName);

      if(numberName || numberNick) {
         return res.status(400).json({
            message: '숫자로만 된 이름은 사용할 수 없습니다.'
         })
      }

      // 비속어 체크
      const badWordsCheck = (text: string) => {
         const normalized = normalize(text);
         return (
            BAD_WORDS.check(normalized) ||
            customWords.words.some((w) => normalized.includes(w))
         )
      }
      const isBadName = badWordsCheck(name);
      const isBadNick = badWordsCheck(nickName);

      if(isBadName || isBadNick) {
         return res.status(400).json({
            message: '이름, 닉네임에 사용할 수 없는 단어가 포함되어 있습니다.'
         })
      }

      
      
      // 비밀번호 암호화
      const hash = await bcrypt.hash(req.body.password, 10);

      // 최종 데이터 송신
      await db.collection("user").insertOne({
         name,
         nickName: nickName,
         thumbnail: '',
         tags,
         email,
         password: hash,
         emailVerified: true,
         createdAt: new Date(),
         post: {recommend: []},
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
