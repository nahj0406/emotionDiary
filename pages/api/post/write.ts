import connectDB from "@/lib/mongoDB/database/database";
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable';
import cloudinary from "@/lib/external_storage/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

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

      const primaryCatId =
         Array.isArray(fields.primaryCatId)
            ? fields.primaryCatId[0]
            : fields.primaryCatId ?? '';

      const secondaryCatId =
         Array.isArray(fields.secondaryCatId)
            ? fields.secondaryCatId[0]
            : fields.secondaryCatId ?? '';

      const tagsRaw = 
         Array.isArray(fields.tags)
            ? fields.tags[0]
            : fields.tags ?? `[]`;

      const tags = JSON.parse(tagsRaw)

      if (
         !title ||
         !content ||
         !bookTitle ||
         !bookAuthor ||
         !bookPublisher ||
         !bookLink ||
         !primaryCatId ||
         !tags
      ) {
         return res.status(400).json({
            message: '필수 내용이 입력되지 않았습니다.',
         });
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

      const bookImage =
         Array.isArray(fields.bookImage)
            ? fields.bookImage[0]
            : fields.bookImage ?? '';

      let thumbnail = '';
      let publicId = '';

      if(bookImage) {
         thumbnail = bookImage;
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

         thumbnail = uploaded.secure_url;
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
      //       .collection<UserDB>('user')
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
            nickName: session?.user.nickName,
         },

         thumbnail,
         publicId,
         recommend: 0,
         views: 0,
         createdAt: new Date(),
         category : {
            primary: primaryCatId,
            secondary: secondaryCatId,
         },
         tags,
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