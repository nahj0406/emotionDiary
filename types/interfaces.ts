import { ObjectId } from "mongodb";

// DB: 몽고 db 데이터
// DTO: 몽고 db 데이터를 클라이언트에서 사용할 때 쓰는 타입

// auth
export interface SignupRequest {
   name: string;
   nickName: string;
   email: string;
   password: string;
};

export interface UserDB {
   _id: ObjectId
   name: string
   nickName: string
   thumbnail: string
   email: string
   password: string
   emailVerified: boolean
   createAt: Date
   tags: string[]
   post: {
      recommend: string[]
      recently: string[]
   }
}

export type nickCheck = {
  available: boolean;
  message: string;
}

export type updateProfileType = {
   thumbnail: File | null;
   nickName: string;
   tags: string[];
   crtPw: string;
   password: string;
}


// =====================================
// category, tag
export interface CategoryDB {
   _id: ObjectId
   name: string
   slug: string
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
}


export interface TagDB {
   _id: ObjectId
   name: string
   slug: string
}

export interface TagDTO {
  _id: string;
  name: string;
  slug: string;
}


// list
export interface PostDB {
   _id: ObjectId
   title: string
   content: string
   thumbnail: string
   books: {
      bookTitle: string,
      uploadBookImg: string,
      bookAuthor: string,
      bookPublisher: string,
      bookLink: string,
   }
   user: {
      id: ObjectId;
      nickName: string,
   }
   recommend: number
   views: number
   createdAt: Date
   updatedAt: Date
   category: {
      primary: string,
      secondary: string,
   }
   tags: string[]
}

export interface PostDTO {
   _id: string;
   title: string;
   content: string;
   thumbnail: string;
   books: {
      bookTitle: string,
      uploadBookImg: string,
      bookAuthor: string,
      bookPublisher: string,
      bookLink: string,
   }
   recommend: number;
   createdAt: string;
   updatedAt: string;
   // userId: ObjectId;
   user: {
      id: string;
      nickName: string;
   }
   category: {
      primary: string,
      secondary: string,
   }
   tags: string[]
}

export interface PostCardDTO {
   _id: string;
   title: string;
   content: string;
   thumbnail: string;
   recommend: number;
   createdAt: string;
   // userId: string;
   category: {
      primary: string;
      secondary: string;
   };

   tags: string[];

   user: PostUserDTO | null;
}

export interface PostUserDTO {
   id: string;
   nickName: string;
   thumbnail: string;
}


// view
export interface CommentDB {
   _id: ObjectId;
   postId: string;
   user: {
      id: ObjectId;
      nickName: string;
   }
   content: string;
   recommend: number;
   parentCommentId: string | null;
   depth: number;
   createdAt: Date;
   updatedAt: Date;
   isDeleted: boolean;
}

export interface CommentDTO {
   _id: string;
   postId: string;
   user: {
      id: string;
      nickName: string;
   }
   content: string;
   recommend: number;
   parentCommentId: string | null;
   depth: number;
   createdAt: string;
   updatedAt: string;
   isDeleted: boolean;
}

export type recommendPostDTO = {
  _id: string;
  recommend: number;
};


// write



// naver, google api
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