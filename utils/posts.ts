import connectDB from "@/lib/mongoDB/database/database";
import { PostDB } from "@/types/interfaces";


export async function getPosts() {
   const client = await connectDB;
   const db = client.db("community");

   const result = await db.collection<PostDB>("post").find().sort({ createdAt: -1 }).toArray();

   return result.map(item => ({
      _id: item._id,
      title: item.title,
      content: item.content,
      thumbnail: item.thumbnail,
      recommend: item.recommend,
      createdAt: item.createdAt,
      userId: item.user?.id ?? "",
      category: {
         primary: item.category.primary,
         secondary: item.category.secondary,
      },
      tags: item.tags,
   }));
}