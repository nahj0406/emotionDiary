import { ObjectId } from "mongodb";
import connectDB from "@/lib/mongoDB/database/database";
import { PostDTO, PostDB, PostCardDTO } from "@/types/interfaces";

export async function mergePosts(
  posts: PostDB[]
): Promise<PostCardDTO[]> {

  const client = await connectDB;
  const db = client.db("community");

  const userIds = posts
    .filter((post) => ObjectId.isValid(post.user.id))
    .map((post) => new ObjectId(post.user.id));

  const users = await db.collection("user")
    .find({
      _id: { $in: userIds }
    })
    .toArray();

  return posts.map((post) => {
    const user = users.find(
      (user) => user._id.toString() === post.user.id.toString()
    );

    return {
      ...post,

      _id: post._id.toString(),
      userId: post.user.id.toString(),

      createdAt:
        post.createdAt instanceof Date
          ? post.createdAt.toISOString()
          : post.createdAt,

      user: user
        ? {
            id: user._id.toString(),
            nickName: user.nickName,
            thumbnail: user.thumbnail,
          }
        : null,
    };
  });
}