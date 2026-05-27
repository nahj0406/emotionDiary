'use client'
import SubmitBtn from "@/components/ui/button/submitBtn/submit_btn"
import { useRouter } from "next/navigation"
import styles from './page.module.css'
import TiptapEditor from "@/components/post/write/Editor/Tiptap";
import clsx from "clsx";
import { ChangeEvent, useEffect, useRef, useState } from "react"
import ConfirmModal from '@/components/modals/ConfirmModal';
import NiceModal from "@ebay/nice-modal-react";
import { useTiptapEditor } from "@/components/post/write/Editor/useTiptap"
import Link from "next/link";

export interface Book {
  id: string;
  title: string;
  image: string;
  author: string;
  publisher: string;
  price: number | null;
  link: string;
  isbn: string;
  source: string;
}

export default function WriteFrame() {

   const [books, setBooks] = useState<Book[]>([]);
   const [bookKeyword, setBookKeyword] = useState<string>('');
   const [search, setSearch] = useState<string>('');
   const [bookData, setBookData] = useState<Book | null>(null);


   useEffect(() => {
      if (!search.trim()) return;

      const fetchBooks = async () => {
         try {
            const res = await fetch(
               "/api/books/search/route?query=" + search
            );

            if (!res.ok) {
               throw new Error("책 데이터를 불러오지 못했습니다.");
            }

            const data = await res.json();

            setBooks(data);
         } catch (err) {
            console.error(err);

            if (err instanceof Error) {
               console.log(err.message);
            }
         }
      };

      fetchBooks();
   }, [search]);

   const router = useRouter();
   const formRef = useRef<HTMLFormElement>(null);
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string>('');
   const [directly, setDirectly] = useState<boolean>(false);
   const [bkInputs, setBkinputs] = useState({
      bookTitle: '',
      bookImage: '',
      bookPublisher: '',
      bookAuthor: '',
      bookLink: '',
   })

   useEffect(()=> {
      if(bookData) {
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setBkinputs({
            bookTitle: bookData?.title ?? '',
            bookImage: bookData?.image ?? '',
            bookPublisher: bookData?.publisher ?? '',
            bookAuthor: bookData?.author ?? '',
            bookLink: bookData?.link ?? '',
         })
      }

      if(directly) {
         setBkinputs({
            bookTitle: '',
            bookImage: '',
            bookPublisher: '',
            bookAuthor: '',
            bookLink: '',
         })

         setBookData(null);
      }

   }, [bookData, directly]);

   const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const {name, value} = e.target;

      setBkinputs((prev)=> ({
         ...prev,
         [name]: value,
      }))
   }


   const editor = useTiptapEditor();

   const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>
   ) => {

      const targetFile = e.target.files?.[0];

      if(!targetFile) return;

      // 이전 preview 메모리 해제
      if(preview) {
         URL.revokeObjectURL(preview);
      }

      const previewUrl = URL.createObjectURL(targetFile);

      setFile(targetFile);
      setPreview(previewUrl);
   };
   

   const handleRemoveImage = () => {

      if(preview) {
         URL.revokeObjectURL(preview);
      }

      setFile(null);
      setPreview('');
   };


   const handleSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();

      if(!formRef.current || !editor) return

      const formData = new FormData();

      formData.append(
         'title', 
         String(new FormData(formRef.current).get('title'))
      );

      formData.append('bookTitle', bkInputs.bookTitle);
      formData.append('bookPublisher', bkInputs.bookPublisher);
      formData.append('bookAuthor', bkInputs.bookAuthor);
      formData.append('bookLink', bkInputs.bookLink);

      if(bkInputs.bookImage) {
         formData.append('bookImage', bkInputs.bookImage);
      }

      formData.append(
         'content', 
         editor.getHTML()
      );

      if(file) {
         formData.append('file', file);
      }

      try {
         const res = await fetch('/api/post/write', {
            method: 'POST',
            body: formData,
         })

         if (!res.ok) {
            const data = await res.json();

            throw new Error(
               data.message || '요청 실패'
            );
         }

         const result = await res.json();

         console.log(result);

         NiceModal.show(ConfirmModal, {
            message: "글이 등록되었습니다.",
            autoClose: 1000,
         });

         router.push(`/list/${result.id}`);

      } catch (err) {
         const message =
            err instanceof Error ? err.message : "알 수 없는 오류";

         await NiceModal.show(ConfirmModal, {
            message: message,
            autoClose: 1000,
         });
         console.error(err)
      }
   }

   // console.log(books);

   console.log(bookData)

   return (
      <section className={clsx(styles.layer_box, 'containerV1')}>
         <h4 className={styles.title}>소개할 책을 검색해 보세요.</h4>

         <div className={styles.block_button} onClick={()=> setDirectly((prev)=> !prev)}>
            {directly ? '검색해서 찾기' : '직접 입력하기'}
            
            {/* 북인풋 데이터 넣는거 분기점을 직접 입력으로 돌리냐 안 돌리냐로 나눠서 value 값을
            비우면 해결될듯. 검색으로 하면 기본값으로 북데이터에 북인풋 데이터가 들어가게 처리. */}
         </div>

         <div className={styles.content}>
            <input 
               className={styles.input}
               type="search" 
               value={bookKeyword} 
               onChange={(e: ChangeEvent<HTMLInputElement>)=> setBookKeyword(e.target.value)} 
               placeholder="검색할 책을 입력해 주세요" 
            />
            <button type="button" onClick={()=> setSearch(bookKeyword)}>검색하기</button>
         </div>

         <div className={styles.serach_list}>
            {  
               search.length !== 0 ?
                  books.length !== 0 ?
                     books.map((book, i) => (
                        <article key={`${i}_${book.isbn}`} onClick={()=> {setBookData(book)} }>
                           <img
                              src={book.image ? book.image : '/next.svg'}
                              alt={book.title}
                              width={'100%'}
                           />

                           <p>{book.title}</p>
                           <p>{book.source}</p>
                           <p>출판사: {book.publisher}</p>
                           <p>글쓴이: {book.author}</p>
                           <Link href={book.link} target="_blank">구매처 확인</Link>
                        </article>
                     ))
                  : (
                     <div>검색된 내용이 없습니다.</div>
                  )
               : (
                  <div>검색어 입력 ㄱㄱ</div>
               )
            }
         </div>

         <form ref={formRef} className={styles.form}>
            <div className={styles.content}>
               <input 
                  className={styles.input} 
                  type="text" 
                  name="title" 
                  placeholder="제목을 입력해 주세요." 
               />
               <input 
                  className={styles.input} 
                  value={bkInputs.bookTitle}
                  onChange={onChangeHandler}
                  readOnly={!directly}
                  type="text" 
                  name="bookTitle" 
                  placeholder="책 제목을 입력해 주세요." 
               />
               <input 
                  className={styles.input} 
                  value={bkInputs.bookPublisher}
                  onChange={onChangeHandler}
                  readOnly={!directly}
                  type="text" 
                  name="bookPublisher" 
                  placeholder="출판사 입력해 주세요." 
               />
               <input 
                  className={styles.input} 
                  value={bkInputs.bookAuthor}
                  onChange={onChangeHandler}
                  readOnly={!directly}
                  type="text"
                  name="bookAuthor" 
                  placeholder="저자를 입력해 주세요." 
               />
               {
                  (bookData?.image && !directly) && (
                     <img
                        src={bookData.image}
                        alt={bookData.title}
                        width={100}
                     />
                  )
               }
               <input 
                  className={styles.input}
                  value={bkInputs.bookLink}
                  onChange={onChangeHandler}
                  readOnly={!directly}
                  type="text" 
                  name="bookLink" 
                  placeholder="책 구매처 링크를 입력하세요." 
               />
               <TiptapEditor editor={editor}></TiptapEditor>
            </div>

            <div className={styles.imageUploader}>
               <input 
                  className={styles.input}
                  type="file" accept="image/*" 
                  onChange={handleFileChange}
                  placeholder="이미지를 업로드 해주세요." 
               />
               {
                  preview && (
                     <div>

                        <img
                           src={preview}
                           alt="preview"
                           width={200}
                        />

                        <button
                           type="button"
                           onClick={handleRemoveImage}
                        >
                           삭제
                        </button>

                     </div>
                  )
               }
            </div>

            <div className={styles.buttonBox}>
               <SubmitBtn content={'취소'} submit={false} onClick={()=> router.back()}/>
               <SubmitBtn content={'작성 완료'} onClick={(e)=> {handleSubmit(e)}}/>
            </div>
         </form>
      </section>
   )
}