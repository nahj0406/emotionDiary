import cloudinary from '@/lib/external_storage/cloudinary'

export default async function postImageDelete(content: string) {

   // 게시물 내용에 있는 이미지들의 publicId 추출.
   const extractPublicIds = (
      html: string
   ) => {
      const matches = html.matchAll(
         /data-public-id="([^"]+)"/g
      )

      return Array.from(matches)
         .map(match => match[1])
   }

   const publicIds = extractPublicIds(content);

   if (publicIds.length > 0) {
      await Promise.all(
         publicIds.map(publicId =>
            cloudinary.uploader.destroy(publicId)
         )
      )
   }
}