import connectDB from "@/lib/mongoDB/database";
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable';
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { UserDB } from "@/types/interfaces";
import { ObjectId } from "mongodb";

export const config = {
   api: {
      bodyParser: false,
   }
};


// formidable Promise 변환
const parseForm = (req: NextApiRequest) => {
   return new Promise<{
      fields: Fields;
      files: Files;
   }>((resolve, reject) => {

      const form = new IncomingForm();

      form.parse(req, (err, fields, files) => {

         if (err) {
            reject(err);
            return;
         }

         resolve({ fields, files });
      });
   });
};


export default async function handler (
   req: NextApiRequest,
   res: NextApiResponse
) {

   if(req.method !== 'POST') {
      return res.status(405).json({
         message: '메서드가 허용되지 않았습니다.'
      });
   }

   try {

      // parse 완료까지 await
      const { fields, files } = await parseForm(req);

      const title =
         Array.isArray(fields.title)
            ? fields.title[0]
            : fields.title;

      const content =
         Array.isArray(fields.content)
            ? fields.content[0]
            : fields.content;

      const bookTitle =
         Array.isArray(fields.bookTitle)
            ? fields.bookTitle[0]
            : fields.bookTitle ?? '';

      const bookAuthor =
         Array.isArray(fields.bookAuthor)
            ? fields.bookAuthor[0]
            : fields.bookAuthor ?? '';

      const bookPublisher =
         Array.isArray(fields.bookPublisher)
            ? fields.bookPublisher[0]
            : fields.bookPublisher ?? '';

      const bookLink =
         Array.isArray(fields.bookLink)
            ? fields.bookLink[0]
            : fields.bookLink ?? '';

      if (
         !title ||
         !content ||
         !bookTitle ||
         !bookAuthor ||
         !bookPublisher ||
         !bookLink
      ) {
         return res.status(400).json({
            message: '필수 내용이 입력되지 않았습니다.',
         });
      }

      const bookImage =
         Array.isArray(fields.bookImage)
            ? fields.bookImage[0]
            : fields.bookImage ?? '';

      let imageUrl = '';
      let publicId = '';

      if(bookImage) {
         imageUrl = bookImage;
      }

      const uploadedFile =
         Array.isArray(files.file)
            ? files.file[0]
            : files.file;

      // cloudinary 업로드
      if (uploadedFile) {

         const uploaded = await cloudinary.uploader.upload(
            uploadedFile.filepath,
            {
               folder: 'posts',
            }
         );

         imageUrl = uploaded.secure_url;
         publicId = uploaded.public_id;
      }

      // 세션
      const session = await getServerSession(
         req,
         res,
         authOptions
      );

      // let userInfo = null;

      const db = (await connectDB).db('community');

      // if(session?.user.id) {

      //    userInfo = await db
      //       .collection<UserDB>('user_cred')
      //       .findOne({
      //          _id: new ObjectId(session.user.id)
      //       });
      // }

      // 게시글 저장
      const result = await db.collection('post').insertOne({
         title,
         content,

         books: {
            bookTitle,
            uploadBookImg: bookImage ?? '',
            bookAuthor,
            bookPublisher,
            bookLink,
         },

         user: {
            id: session?.user.id,
         },

         imageUrl,
         publicId,

         createdAt: new Date(),
      });

      //응답 종료
      return res.status(200).json({
         success: true,
         id: result.insertedId,
      });

   } catch (err) {

      console.error(err);

      return res.status(500).json({
         success: false,
         message: '요청이 실패하였습니다.',
      });
   }
}