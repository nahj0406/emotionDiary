import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import connectDB from '@/lib/mongoDB/database/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { UserDB } from '@/types/interfaces';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = (await connectDB).db('community');

  // 로그인 세션 확인
  const session = await getServerSession(
    req,
    res,
    authOptions
  );

  if (!session?.user?.id) {
    return res.status(401).json({
      message: '로그인이 필요합니다.',
    });
  }

  const userInfo = await db
    .collection<UserDB>('user')
    .findOne({
      _id: new ObjectId(session.user.id),
    });

  if (!userInfo) {
    return res.status(404).json({
      message: '유저 정보 없음',
    });
  }

  // =========================
  // GET : 저장요소 확인용
  // =========================
  if (req.method === 'GET') {
    try {
      const postId = req.query.postId as string;

      const bookmark = await db.collection('post_bookmark').findOne({userId: session.user.id, postId: postId});

      return res.status(200).json({
        bookmark: !!bookmark,
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        bookmark: false,
        message: '서버 에러',
      });
    }
  }

  // =========================
  // POST : 북마크 등록용
  // =========================
  if (req.method === 'POST') {
    try {
      const postId = req.body.id;

      // 현재 게시물 저장 여부 검사
      const alreadyBookmarked = await db.
         collection('post_bookmark')
         .findOne({
            userId: session.user.id,
            postId: postId,
         });

      let result;

      if (!alreadyBookmarked) {

         result = await db
            .collection('post_bookmark')
            .insertOne({
               userId: session.user.id,
               postId: postId,
               createdAt: new Date(),
            });

         return res.status(200).json({
            bookmark: true,
         });

      } else {

         result = await db
            .collection('post_bookmark')
            .deleteOne({
               userId: session.user.id,
               postId: postId,
            });

         return res.status(400).json({
            bookmark: false,
            message: '저장된 게시물 삭제 완료'
         })
      }

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: '서버 에러',
      });
    }
  }

   return res.status(405).json({
      message: '허용되지 않은 메서드입니다.',
   });
}