import type { NextApiRequest, NextApiResponse } from 'next';
import type { Filter } from 'mongodb';
import connectDB from '@/lib/mongoDB/database/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getUserById } from '@/lib/mongoDB/getUserById';
import { mergePosts } from '@/lib/mongoDB/mergePosts';
import { PostDB } from '@/types/interfaces';

type SortKey = 'recommend' | 'popular' | 'latest';

type PopularPostDB = PostDB & {
  score: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: '메서드가 허용되지 않았습니다.',
    });
  }

  const key =
    typeof req.query.key === 'string'
      ? req.query.key
      : '';

  const keyword =
    typeof req.query.keyword === 'string'
      ? req.query.keyword.trim()
      : '';

  const validKeys: SortKey[] = [
    'recommend',
    'popular',
    'latest',
  ];

  if (!validKeys.includes(key as SortKey)) {
    return res.status(400).json({
      message: '탭 값이 제대로 들어오지 않았습니다.',
    });
  }

  /*
   * 사용자가 정규식 문자를 검색해도
   * 일반 문자열로 검색되도록 이스케이프 처리
   */
  const escapedKeyword = keyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

  const searchFilter: Filter<PostDB> = keyword
    ? {
        $or: [
          {
            title: {
              $regex: escapedKeyword,
              $options: 'i',
            },
          },
          {
            content: {
              $regex: escapedKeyword,
              $options: 'i',
            },
          },
          {
            tags: {
              $regex: escapedKeyword,
              $options: 'i',
            },
          },
          {
            'books.bookTitle': {
              $regex: escapedKeyword,
              $options: 'i',
            },
          },
          {
            'books.bookAuthor': {
              $regex: escapedKeyword,
              $options: 'i',
            },
          },
        ],
      }
    : {};

  try {
    const client = await connectDB;
    const db = client.db('community');

    const session = await getServerSession(
      req,
      res,
      authOptions
    );

    // 검색 조건이 적용된 인기순 목록
    const popularList = await db
      .collection<PostDB>('post')
      .aggregate<PopularPostDB>([
        {
          $match: searchFilter,
        },
        {
          $addFields: {
            score: {
              $subtract: [
                {
                  $add: [
                    { $multiply: ['$recommend', 5] },
                    { $multiply: ['$views', 0.2] },
                  ],
                },
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            '$$NOW',
                            '$createdAt',
                          ],
                        },
                        1000 * 60 * 60 * 24 * 7,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
          },
        },
        {
          $sort: {
            score: -1,
          },
        },
      ])
      .toArray();

    switch (key as SortKey) {
      case 'recommend': {
        const popularPosts = await mergePosts(popularList);

        if (!session?.user.id) {
          return res.status(200).json(popularPosts);
        }

        const userInfo = await getUserById(session.user.id);

        const recommendSource = await db
          .collection<PostDB>('post')
          .find({
            ...searchFilter,
            tags: {
              $in: userInfo?.tags ?? [],
            },
          })
          .toArray();

        const recommendPosts = await mergePosts(recommendSource);

        const recommendIds = new Set(
          recommendPosts.map((post) => post._id)
        );

        const filteredPopularPosts = popularPosts.filter(
          (post) => !recommendIds.has(post._id)
        );

        return res.status(200).json([
          ...recommendPosts,
          ...filteredPopularPosts,
        ]);
      }

      case 'popular': {
        const result = await mergePosts(popularList);

        return res.status(200).json(result);
      }

      case 'latest': {
        const latestList = await db
          .collection<PostDB>('post')
          .find(searchFilter)
          .sort({ createdAt: -1 })
          .toArray();

        const result = await mergePosts(latestList);

        return res.status(200).json(result);
      }
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: '조회 실패',
    });
  }
}