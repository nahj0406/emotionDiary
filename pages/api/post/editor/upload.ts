import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import cloudinary from '@/lib/external_storage/cloudinary'

export const config = {
   api: {
      bodyParser: false,
   },
}

const parseForm = (req: NextApiRequest) => {
   return new Promise<{
      fields: Fields
      files: Files
   }>((resolve, reject) => {
      const form = new IncomingForm()

      form.parse(req, (err, fields, files) => {
         if (err) {
         reject(err)
         return
         }

         resolve({ fields, files })
      })
   })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
   if (req.method !== 'POST') {
      return res.status(405).json({
         message: '메서드가 일치하지 않습니다.',
      })
   }

   try {
      const { files } = await parseForm(req)

      const image = Array.isArray(files.image)
         ? files.image[0]
         : files.image

      if (!image) {
         return res.status(400).json({
         message: '이미지가 없습니다.',
         })
      }

      const uploaded = await cloudinary.uploader.upload(
         image.filepath,
         {
            folder: 'posts/editor',
         }
      )

      return res.status(200).json({
         url: uploaded.secure_url,
         publicId: uploaded.public_id,
      })
   } catch (err) {
      console.error(err)

      return res.status(500).json({
         message: '이미지 업로드 실패',
      })
   }
}