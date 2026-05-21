import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleBookItem, NaverBookItem } from "@/utils/types/interfaces";

type GoogleBooksResponse = {
   items?: GoogleBookItem[];
};

type NaverBooksResponse = {
   items: NaverBookItem[];
};

type Book = {
   source: "google" | "naver";
   id: string;
   title: string;
   image: string;
   author: string;
   publisher: string;
   price: number | null;
   link: string;
   isbn: string;
};

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse<Book[] | { error: string }>
) {
   // GET만 허용
   if (req.method !== "GET") {
      return res.status(405).json({
         error: "Method not allowed",
      });
   }

   const query = req.query.query as string;

   if (!query?.trim()) {
      return res.status(400).json({
         error: "query is required",
      });
   }

   const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

   const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;

   const NAVER_CLIENT_SECRET =
      process.env.NAVER_CLIENT_SECRET;

   try {
      // 동시에 요청
      const [googleResponse, naverResponse] =
         await Promise.all([
            fetch(
               `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                  query
               )}&maxResults=20&key=${GOOGLE_API_KEY}`
            ),

            fetch(
               `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(
                  query
               )}&display=100`,
               {
                  headers: {
                     "X-Naver-Client-Id":
                        NAVER_CLIENT_ID || "",

                     "X-Naver-Client-Secret":
                        NAVER_CLIENT_SECRET || "",
                  },
               }
            ),
         ]);

      if (!googleResponse.ok) {
         throw new Error("Google Books API error");
      }

      if (!naverResponse.ok) {
         throw new Error("Naver Books API error");
      }

      const googleData: GoogleBooksResponse =
         await googleResponse.json();

      const naverData: NaverBooksResponse =
         await naverResponse.json();

      // 구글 데이터 변환
      const googleBooks: Book[] =
         googleData.items?.map((book) => {
            const volumeInfo = book.volumeInfo;

            const isbn =
               volumeInfo.industryIdentifiers?.find(
                  (id) => id.type === "ISBN_13"
               )?.identifier ||
               volumeInfo.industryIdentifiers?.[0]
                  ?.identifier ||
               "";

            return {
               source: "google",

               id: book.id,

               title: volumeInfo.title || "",

               image:
                  volumeInfo.imageLinks?.thumbnail || "",

               author:
                  volumeInfo.authors?.join(", ") || "",

               publisher:
                  volumeInfo.publisher || "",

               price:
                  book.saleInfo?.listPrice?.amount ||
                  null,

               link: volumeInfo.infoLink || "",

               isbn,
            };
      }) || [];

      // 네이버 데이터 변환
      const naverBooks: Book[] =
      naverData.items?.map((book) => {
         const isbn13 =
            book.isbn.split(" ")[0] || "";

         return {
            source: "naver",

            id: isbn13,

            title: book.title.replace(/<[^>]*>/g, ""),

            image: book.image,

            author: book.author,

            publisher: book.publisher,

            price: Number(book.discount) || null,

            link: book.link,

            isbn: isbn13,
         };
      }) || [];

      // 배열 합치기
      const books = [...naverBooks, ...googleBooks];

      return res.status(200).json(books);
   } catch (error) {
      console.error(error);

      return res.status(500).json({
         error: "failed to fetch books",
      });
   }
}