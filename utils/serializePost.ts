import { PostDB } from "@/types/interfaces";

export function serializePost(post: PostDB) {
   return {
      ...post,
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      recommend: post.recommend,
      createdAt: post.createdAt.toISOString(),
      books: {
         bookTitle: post.books.bookTitle,
         uploadBookImg: post.books.uploadBookImg,
         bookAuthor: post.books.bookAuthor,
         bookPublisher: post.books.bookPublisher,
         bookLink: post.books.bookLink,
      },
      user: {
         id: post.user.id.toString() ?? "",
         nickName: post.user.nickName ?? "",
      },
      category: {
         primary: post.category.primary,
         secondary: post.category.secondary,
      },
      tags: post.tags,
   }
}