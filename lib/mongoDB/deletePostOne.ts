
import { PostCardDTO } from "@/types/interfaces";


export default async function deleteOne (post: PostCardDTO) {
   const res = await fetch(
      `/api/post/delete?post=${encodeURIComponent(JSON.stringify(post))}`,
      {
         method: 'DELETE',
      }
   )

   if (!res.ok) {
      throw new Error('삭제 실패')
   }

   return await res.json();
}