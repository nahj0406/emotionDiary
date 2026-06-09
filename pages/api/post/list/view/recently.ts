import connectDB from "@/lib/mongoDB/database/database";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { UserDB } from "@/types/interfaces";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: '허용되지 않은 메서드입니다.',
    });
  }

  const db = (await connectDB).db('community');

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.id) {
    return res.status(401).json({
      message: '유저 정보가 없습니다.',
    });
  }

  try {
    const { postId } = req.body;

    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({
        message: 'postId가 없습니다.',
      });
    }

    await db.collection<UserDB>('user').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $pull: {
          'post.recently': postId,
        },
      }
    );

    await db.collection<UserDB>('user').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $push: {
          'post.recently': {
            $each: [postId],
            $position: 0,
            $slice: 30,
          },
        },
      }
    );

    return res.status(200).json(true);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: '최근 게시글 기록 실패',
    });
  }
}