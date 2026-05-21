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
  createdAt: Date
}

export interface postType {
   _id: string;
   title: string;
   content: string;
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