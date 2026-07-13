import connectDB from '@/lib/mongoDB/database/database';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { ObjectId } from 'mongodb';


export default async function handler (
   req: NextApiRequest,
   res: NextApiResponse
) {
   const db = (await connectDB).db('community');

   const session = await getServerSession(req, res, authOptions);

   if(!session?.user?.id) {
      return res.status(401).json({
         message: '로그인이 필요합니다.',
      });
   }

   const userInfo = await db.collection('user').findOne({
      _id: new ObjectId(session.user.id),
   });

   if (!userInfo) {
      return res.status(404).json({
         message: '유저 정보 없음',
      });
   }

   if(req.method === 'GET') {
      const commentId = req.query.comment_id as string;
      const recommend_comments = await db.collection('comment_recommends').findOne({
         commentId: commentId,
      })

      try {
         const liked = recommend_comments?.userId === session?.user?.id;

         return res.status(200).json({
            liked,
         });
      } catch(err) {
         console.error(err);

         return res.status(500).json({
         liked: false,
         message: '서버 에러',
         });
      }
   }

   // if(req.method !== 'POST') {
   //    return res.status(401).json({
   //       message: '메서드가 올바르지 않습니다.'
   //    })
   // }


   if(req.method === 'POST') {

      try {
         const cmtId = req.body.id;

         const alreadyLiked = await db
            .collection('comment_recommends')
            .findOne({
               userId: session.user.id,
               commentId: cmtId,
            })
         
         let result;

         if(alreadyLiked) {
            await db.collection('comment_recommends')
            .deleteOne(
               {
                  userId: session.user.id,
                  commentId: cmtId,
               },
            )

            if (!ObjectId.isValid(cmtId)) {
               return res.status(400).json({
                  message: '잘못된 댓글 ID입니다.',
               });
            }

            result = await db
               .collection('comments')
               .findOneAndUpdate(
                  {
                     _id: new ObjectId(cmtId),
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

         await db
         .collection('comment_recommends')
         .insertOne(
            {
               userId: session.user.id,
               commentId: cmtId,
            }
         );

         result = await db.collection('comments').findOneAndUpdate(
            {_id: new ObjectId(cmtId)},
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
         })

      } catch(err) {
         console.error(err);

         return res.status(500).json({
            message: '좋아요 기능이 실패했습니다.',
         });
      }
   }

   return res.status(405).json({
      message: '메서드가 올바르지 않습니다.'
   })
}