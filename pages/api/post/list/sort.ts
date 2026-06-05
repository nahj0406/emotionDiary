import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from "@/lib/mongoDB/database/database";
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getUserById } from '@/lib/mongoDB/getUserById';
import { mergePosts } from '@/lib/mongoDB/mergePosts';
import { PostDTO } from '@/types/interfaces';

type PopularPostDTO = PostDTO & {
   score: number;
}

export default async function handler (
   req: NextApiRequest,
   res: NextApiResponse,
) {
   if(req.method !== 'GET') {
      return res.status(405).json({
         message: '메서드가 허용되지 않았습니다.'
      })
   }

   if(!req.query.key) return res.status(400).json({
      message: '탭 값이 제대로 들어오지 않았습니다.'
   });

   const key = req.query.key as string;
   const client = await connectDB;
   const db = client.db("community");
   const session = await getServerSession(req, res, authOptions);

   // 인기순 리스트 - 추천순에도 인기순이 후순위로 들어가서 따로 변수로 빼둠.
   const popularList = await db.collection<PostDTO>('post')
   .aggregate<PopularPostDTO>([
      {
         $addFields: {
            score: {
               // 총 인기 점수: (좋아요 * 5 + 조회수 * 0.2) - 경과일 * 2
               $subtract: [ 
                  //  subtract : - 연산
                  // 좋아요 * 5 + 조회수 * 0.2
                  {
                     $add: [
                        { $multiply: ['$recommend', 5] },
                        { $multiply: ['$views', 0.2] }
                     ]
                  },

                  // 경과일 * 2
                  {
                     $multiply: [
                        {
                           $divide: [
                              {
                                 $subtract: [new Date(), '$createdAt']
                              },
                              1000 * 60 * 60 * 24 * 7
                           ]
                        },
                        2
                     ]
                  }
               ]
            }
         }
      },

      {
         $sort: {
            score: -1
         }
      }
   ])
   .toArray();

   try {
      // key 타입 맞춰서 각 콜렉션 불러올 조건문 작업하기.
      let result = [];
      let sortList = [];

      switch (key) {
         case 'recommend':
            if (!session?.user.id) return res.status(401).json({});

            const userInfo = await getUserById(session?.user.id);

            sortList = await db.collection<PostDTO>('post').find({
               tags: {
                  $in: userInfo?.tags ?? []
               }
            }).toArray();

            const recommendList = await mergePosts(sortList);

            const recommendIds = recommendList.map(
               item => item._id.toString()
            );

            const filteredPopular = popularList.filter(
               item => !recommendIds.includes(item._id.toString())
            );

            result = [
               ...recommendList,
               ...filteredPopular,
            ];

            return res.status(200).json(result);

         case 'popular':

            result = await mergePosts(popularList);

            return res.status(200).json(result);
         case 'latest':
            sortList = 
               await db.collection<PostDTO>('post').find()
               .sort({ createdAt: -1 }).toArray();

            result = await mergePosts(sortList);

            return res.status(200).json(result);
      }

   } catch(err) {
      if (err instanceof Error) {
         console.error(err.message);
      }

      return res.status(500).json({
         error: '조회 실패'
      });
   }
}