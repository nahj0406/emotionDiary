import { ObjectId } from "mongodb";
import connectDB from "@/lib/mongoDB/database/database";
import { PostDTO, PostCardDTO } from "@/types/interfaces";

export async function mergePosts(
  posts: PostDTO[]
): Promise<PostCardDTO[]> {

  const client = await connectDB;
  const db = client.db("community");

  const userIds = posts
    .filter((post) => ObjectId.isValid(post.userId))
    .map((post) => new ObjectId(post.userId));

  const users = await db.collection("user")
    .find({
      _id: { $in: userIds }
    })
    .toArray();

  return posts.map((post) => {
    const user = users.find(
      (user) => user._id.toString() === post.userId.toString()
    );

    return {
      ...post,

      _id: post._id.toString(),
      userId: post.userId.toString(),

      createdAt:
        post.createdAt instanceof Date
          ? post.createdAt.toISOString()
          : post.createdAt,

      user: user
        ? {
            nickName: user.nickName,
            thumbnail: user.thumbnail,
          }
        : null,
    };
  });
}