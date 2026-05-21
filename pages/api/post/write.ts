import connectDB from "@/utils/database";
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable';
import cloudinary from "@/lib/cloudinary";

export const config = {
   api: {
      bodyParser: false,
   }
};


export default async function handler (req: NextApiRequest, res: NextApiResponse) {
   if(req.method !== 'POST') {
      return res.status(405).json({
         message: '메서드가 허용되지 않았습니다.'
      })
   }

   try {
      const form = new IncomingForm();

      form.parse(req, async (err, fields, files) => {
         if (err) {
            return res.status(500).json({
               message: '파일 파싱 실패',
            })
         }

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

         if(!title || !content || !bookTitle || !bookAuthor || !bookPublisher || !bookLink) {
            return res.status(400).json({
               message: '필수 내용이 입력되지 않았습니다.',
            })
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

         if (uploadedFile) {
            const uploaded = await cloudinary.uploader.upload(
               uploadedFile.filepath,
               {folder: 'posts',}
            )

            imageUrl = uploaded.secure_url;
            publicId = uploaded.public_id;
         }
            

         const db = (await connectDB).db('community');
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
            imageUrl,
            publicId,
            createdAt: new Date(),
         });

         // return res.status(200).redirect(302, '/list');

      })
   } catch (err) {
      return res.status(500).json('요청이 실패하였습니다.');
   }
}