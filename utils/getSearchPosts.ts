import connectDB from "@/lib/mongoDB/database/database";
import { mergePosts } from "@/lib/mongoDB/mergePosts";
import { PostDB, PostDTO } from "@/types/interfaces";


export async function getSearchPosts(keyword: string) {
   const client = await connectDB;
   const db = client.db("community");

   const search_List = await db.collection<PostDB>('post').find({
      $or: [
         {title: {$regex: keyword, $options: 'i'}},
         {'books.bookTitle': {$regex: keyword, $options: 'i'}},
         {'books.bookAuthor': {$regex: keyword, $options: 'i'}},
         {'books.bookPublisher': {$regex: keyword, $options: 'i'}},
         {content: {$regex: keyword, $options: 'i'}}
      ]
   }).sort({ createdAt: -1 }).toArray();

   // console.log(result[5])

   return search_List.map(item => ({
      _id: item._id,
      title: item.title,
      content: item.content,
      thumbnail: item.thumbnail,
      recommend: item.recommend,
      views: item.views,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
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