import connectDB from "@/utils/database"
import { ListContainer } from "./client";
import { PostDB } from "@/utils/types/interfaces";

export default async function List() {

   const client = await connectDB;
   const db = client.db('community');
   const result = await db.collection<PostDB>('post').find().toArray();

   const posts = result.map(item => ({
      _id: item._id.toString(), // ⭐ 여기서 변환
      title: item.title,
      content: item.content,
   }))

   return (
      <div className="containerV1">
         <ListContainer result={posts} />
      </div>
   )
}