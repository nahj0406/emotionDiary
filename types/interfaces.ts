import { ObjectId } from "mongodb";

export interface UserDB {
  _id: ObjectId
  name: string
  nickName: string
  thumbnail: string
  email: string
  password: string
  emailVerified: boolean
  createAt: Date
  post: {
   recommend: string[]
  }
}

export interface PostDB {
  _id: ObjectId
  title: string
  content: string
  imageUrl: string
  books: {
   bookTitle: string,
   uploadBookImg: string,
   bookAuthor: string,
   bookPublisher: string,
   bookLink: string,
  }
  user: {
   id: string;
  }
  recommend: number,
  createdAt: Date
}

export interface postType {
   _id: string;
   title: string;
   content: string;
   imageUrl: string;
   recommend: number;
   createdAt: Date | string;
   userId: string;
}

export interface CommentType {
   _id: ObjectId;
   postId: ObjectId;
   nickName: string;
   content: string;
   recommend: number;
   parentCommentId: string | null;
   depth: number;
   createdAt: Date;
}

export interface SignupRequest {
  name: string;
  nickName: string;
  email: string;
  password: string;
};

export interface NaverBookItem {
  title: string;
  image: string;
  author: string;
  publisher: string;
  discount: string;
  link: string;
  isbn: string;
};

export type GoogleBookItem = {
  id: string;
  volumeInfo: {
      title: string;
      authors?: string[];
      publisher?: string;
      imageLinks?: {
         thumbnail?: string;
      };
      industryIdentifiers?: {
         type: string;
         identifier: string;
      }[];
      infoLink?: string;
  };
  saleInfo?: {
      listPrice?: {
         amount: number;
      };
  };
};

export type ClientPost = {
  _id: string;
  recommend: number;
};