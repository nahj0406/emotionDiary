import connectDB from "@/utils/database";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
   providers: [
      //  GithubProvider({
      //    clientId: 'Github에서 발급받은 ID',
      //    clientSecret: 'Github에서 발급받은 Secret',
      //  }),

      CredentialsProvider({
         //1. 로그인페이지 폼 자동생성해주는 코드
         name: "credentials",
         credentials: {
            email: { label: "email", type: "text" },
            password: { label: "password", type: "password" },
         },

         //2. 로그인요청시 실행되는코드
         //직접 DB에서 아이디,비번 비교하고
         //아이디,비번 맞으면 return 결과, 틀리면 return null 해야함
         async authorize(credentials) {
            if (!credentials) return null;

            const db = (await connectDB).db("community");

            const user = await db.collection("user_cred").findOne({
               email: credentials.email,
            });

            if (!user) {
               console.log("해당 이메일은 없음");
               return null;
            }

            const pwcheck = await bcrypt.compare(
               credentials.password,
               user.password,
            );

            if (!pwcheck) {
               console.log("비번틀림");
               return null;
            }

            if(!user.emailVerified) {
               console.log('이메일 인증 안됨');
               throw new Error('이메일 인증이 필요합니다.')
            }

            // ✅ 핵심: NextAuth User 형태로 변환
            return {
               id: user._id.toString(),
               nickname: user.email,
               name: user.name ?? null,
               email: user.email,
            };
         },
      }),
   ],

   //3. jwt 써놔야 잘됩니다 + jwt 만료일설정
   session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, //총일수, 하루, 시간, 분 = 7일
   },

   callbacks: {
      //4. jwt 만들 때 실행되는 코드
      //user변수는 DB의 유저정보담겨있고 token.user에 뭐 저장하면 jwt에 들어갑니다.
      jwt: async ({ token, user }) => {
         if (user) {
            token.user = {
               nickname: user.nickname,
               name: user.name,
               email: user.email,
            };
         }
         return token;
      },

      //5. 유저 세션이 조회될 때 마다 실행되는 코드
      session: async ({ session, token }) => {
         session.user = token.user!;
         return session;
      },
   },

   adapter: MongoDBAdapter(connectDB),
   secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
