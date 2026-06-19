import connectDB from "@/lib/mongoDB/database/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import postImageDelete from "@/lib/cloudinary/postImageDelete";


export default async function DELETE (req: NextApiRequest, res: NextApiResponse) {

   if(req.method !== 'DELETE') {
      return res.status(401).json({message: '메서드가 일치하지 않습니다.'})
   }

   const { postId } = req.query;
   const session = await getServerSession(
      req,
      res,
      authOptions
   );

   if(typeof postId !== 'string') {
      return res.status(400).json({
         message: '잘못된 요청입니다.'
      })
   }

   if (!ObjectId.isValid(postId)) {
      return res.status(400).json({
         message: '올바르지 않은 게시글 ID입니다.'
      });
   }

   if(!session?.user.id) {
      return res.status(405).json({
         message: '로그인 후 이용해 주세요.'
      })
   }

   const db = (await connectDB).db('community');
   const postInfo = await db.collection('post').findOne({
      _id: new ObjectId(postId),
   })

   if (!postInfo) {
      return res.status(404).json({
         message: '게시글이 존재하지 않습니다.'
      })
   }

   if(postInfo?.user.id.toString() !== session?.user.id) {
      return res.status(400).json({
         message: '게시글 작성자 본인이 아닙니다.'
      })
   }


   try {

      // 게시물 내용에 있는 이미지들의 publicId 추출 삭제 함수
      await postImageDelete(postInfo?.content);


      // 게시물 삭제
      const result = await db.collection('post').deleteOne({
         _id: new ObjectId(postId),
      });

      if(result.deletedCount === 0) {
         return res.status(400).json({
            message: '삭제할 게시글을 찾을 수 없습니다.',
         })
      }

      return res.status(200).json({
         message: '삭제 완료',
      })

   } catch (err) {
      console.error('api 에러', err);

      return res.status(500).json({
         message: '삭제 에러'
      })
   }
}