import connectDB from "@/lib/mongoDB/database";
import { PostDB } from "@/types/interfaces";


export async function getPosts() {
   const client = await connectDB;
   const db = client.db("community");

   const result = await db.collection<PostDB>("post").find().toArray();

   return result.map(item => ({
      _id: item._id.toString(),
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl,
      recommend: item.recommend,
      createdAt: item.createdAt.toISOString(),
      userId: item.user?.id ?? "",
   }));
}