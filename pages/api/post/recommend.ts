import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import connectDB from '@/lib/mongoDB/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
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
    .collection<UserDB>('user_cred')
    .findOne({
      _id: new ObjectId(session.user.id),
    });

  if (!userInfo) {
    return res.status(404).json({
      message: '유저 정보 없음',
    });
  }

  // =========================
  // GET
  // =========================
  if (req.method === 'GET') {
    try {
      const postId = req.query.postId as string;

      const liked =
        userInfo.post?.recommend?.includes(postId) ||
        false;

      return res.status(200).json({
        liked,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        liked: false,
        message: '서버 에러',
      });
    }
  }

  // =========================
  // POST
  // =========================
  if (req.method === 'POST') {
    try {
      const postId = req.body.id;

      // 현재 게시물 좋아요 여부 검사
      const alreadyLiked = await db
        .collection<UserDB>('user_cred')
        .findOne({
          _id: new ObjectId(session.user.id),
          'post.recommend': postId,
        });

      let result;

      // =========================
      // 좋아요 취소
      // =========================
      if (alreadyLiked) {
        // 유저 좋아요 기록 제거
        await db
          .collection('user_cred')
          .updateOne(
            {
              _id: new ObjectId(
                session.user.id
              ),
            },
            {
              $pull: {
                'post.recommend': postId,
              },
            }
          );

        // 게시글 좋아요 -1
        result = await db
          .collection('post')
          .findOneAndUpdate(
            {
              _id: new ObjectId(postId),
            },
            {
              $inc: {
                recommend: -1,
              },
            },
            {
              returnDocument: 'after',
            }
          );

        return res.status(200).json({
          liked: false,
          recommend:
            result?.value?.recommend || 0,
        });
      }

      // =========================
      // 좋아요 추가
      // =========================
      await db
        .collection('user_cred')
        .updateOne(
          {
            _id: new ObjectId(
              session.user.id
            ),
          },
          {
            $addToSet: {
              'post.recommend': postId,
            },
          }
        );

      // 게시글 좋아요 +1
      result = await db
        .collection('post')
        .findOneAndUpdate(
          {
            _id: new ObjectId(postId),
          },
          {
            $inc: {
              recommend: 1,
            },
          },
          {
            returnDocument: 'after',
          }
        );

      return res.status(200).json({
        liked: true,
        recommend:
          result?.value?.recommend || 0,
      });
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