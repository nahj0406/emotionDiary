import connectDB from "@/lib/mongoDB/database/database";
import { PostDB } from "@/types/interfaces";


export async function getPosts() {
   const client = await connectDB;
   const db = client.db("community");

   const result = await db.collection<PostDB>("post").find().sort({ createdAt: -1 }).toArray();

   // console.log(result[5])

   return result.map(item => ({
      _id: item._id,
      title: item.title,
      content: item.content,
      thumbnail: item.thumbnail,
      recommend: item.recommend,
      views: item.views,
      createdAt: item.createdAt,
      books: {
         bookTitle: item.books.bookTitle,
         uploadBookImg: item.books.uploadBookImg,
         bookAuthor: item.books.bookAuthor,
         bookPublisher: item.books.bookPublisher,
         bookLink: item.books.bookLink,
      },
      user: {
         id: item.user.id ?? "",
         nickName: item.user.nickName ?? "",
      },
      category: {
         primary: item.category.primary,
         secondary: item.category.secondary,
      },
      tags: item.tags,
   }));
}