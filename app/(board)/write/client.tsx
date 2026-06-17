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
import TagCheckBoxGroup from "@/components/ui/tab/tag/tagCheckBoxGroup";
import { CategoryDTO, PostDTO, TagDTO } from "@/types/interfaces";
import CatSelect from "@/components/ui/select/category/CatSelect";
import { createPostSubmit, publicIdImageDelete, updatePostSubmit } from "@/utils/requester/requester";

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

type Props = {
  initialTags: TagDTO[];
  initialCat: CategoryDTO[];
  edit?: PostDTO | null;
};

export default function WriteFrame({initialTags, initialCat, edit}: Props) {

   const [books, setBooks] = useState<Book[]>([]);
   const [bookKeyword, setBookKeyword] = useState<string>('');
   const [search, setSearch] = useState<string>('');
   const [bookData, setBookData] = useState<Book | null>(null);
   const [tagKeys, setTagKeys] = useState<string[]>(edit?.tags ?? []);
   const [catKeys, setCatKeys] = useState({
      primary: edit?.category.primary ?? "",
      secondary: edit?.category.secondary ?? "",
   })

   const secondCat = initialCat.filter(
    (cat) => cat._id !== catKeys.primary
  );


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
      bookTitle: edit?.books.bookTitle ?? '',
      bookImage: edit?.books.uploadBookImg ?? '',
      bookPublisher: edit?.books.bookPublisher ?? '',
      bookAuthor: edit?.books.bookAuthor ?? '',
      bookLink: edit?.books.bookLink ?? '',
   })
   // const [editCat, setEditCat] = useState<string>('');

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


   const uploadedImageIdsRef = useRef<string[]>([]);

   const editor = useTiptapEditor({
      editContent: edit?.content,
      onUploadImage: publicId => {
         uploadedImageIdsRef.current.push(publicId)
      },
   })

   const extractPublicIds = (
      html: string
   ) => {
      const matches = html.matchAll(
         /data-public-id="([^"]+)"/g
      )
      
      return Array.from(matches)
         .map(match => match[1])
   }

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

      if(edit) {
         formData.append('_id', edit?._id);
      }

      formData.append(
         'title', 
         String(new FormData(formRef.current).get('title'))
      );

      formData.append('bookTitle', bkInputs.bookTitle);
      formData.append('bookPublisher', bkInputs.bookPublisher);
      formData.append('bookAuthor', bkInputs.bookAuthor);
      formData.append('bookLink', bkInputs.bookLink);
      formData.append('primaryCatId', catKeys.primary);
      formData.append('secondaryCatId', catKeys.secondary);
      formData.append('tags', JSON.stringify(tagKeys));



      if(bkInputs.bookImage) {
         formData.append('bookImage', bkInputs.bookImage);
      }

      formData.append(
         'content', 
         editor.getHTML()
      );

      const contentValue = formData.get('content');

      if (typeof contentValue !== 'string') {
         throw new Error('content가 올바르지 않습니다.');
      }

      if(file) {
         formData.append('file', file);
      }

      try {
         let res = null;

         if(edit) {
            // 글 수정
            const oldIds = extractPublicIds(edit.content)

            const newIds = extractPublicIds(contentValue)

            const removedIds =
               oldIds.filter(
                  id => !newIds.includes(id)
               )

            if (uploadedImageIdsRef.current.length > 0) {
               await publicIdImageDelete(removedIds);
            }

            res = await updatePostSubmit(formData);
         } else {
            // 글 작성
            
            const contentPublicIds = extractPublicIds(contentValue);

            const unusedPublicIds =
               uploadedImageIdsRef.current.filter(
                  id => !contentPublicIds.includes(id)
               )
            
            if (uploadedImageIdsRef.current.length > 0) {
               await publicIdImageDelete(unusedPublicIds);
            }

            res = await createPostSubmit(formData);
         }

         if (!res.ok) {
            const data = await res.json();

            throw new Error(
               data.message || '요청 실패'
            );
         }

         const result = await res.json();

         // console.log(result);

         NiceModal.show(ConfirmModal, {
            message: result.message,
            autoClose: 1000,
         });

         router.push(`/list/${result.id}`);

      } catch (err) {
         const message =
            err instanceof Error ? err.message : "알 수 없는 오류";

         NiceModal.show(ConfirmModal, {
            message: message,
            autoClose: 1000,
         });
         console.error(err)
      }
   }

   const cancelWrite = async () => {
      if (uploadedImageIdsRef.current.length > 0) {
         await fetch('/api/post/editor/delete', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               publicIds: uploadedImageIdsRef.current,
            }),
         })
      }

      uploadedImageIdsRef.current = []

      router.back()
   }

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
                  defaultValue={edit?.title}
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
                  (bkInputs.bookImage && !directly) && (
                     <img
                        src={bkInputs.bookImage}
                        alt={bkInputs.bookTitle}
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

               <div>
                  <span>대표 장르 선택</span>
                  <CatSelect 
                     array={initialCat}
                     value={catKeys.primary}
                     onChange={(value)=> 
                        setCatKeys((prev)=> ({
                           ...prev,
                           primary: value,
                           secondary: prev.secondary === value ? "" : prev.secondary,
                        }))
                     }
                     defaultOption={'대표 장르를 선택해 주세요.'} 
                  />
               </div>

               <div>
                  <span>보조 장르 선택</span>
                  <CatSelect 
                     array={secondCat} 
                     value={catKeys.secondary}
                     onChange={(value)=> 
                        setCatKeys((prev)=> ({
                           ...prev,
                           secondary: value,
                        }))
                     }
                     disabled={
                        edit 
                        ? !edit?.category.primary || !catKeys.primary
                        : !catKeys.primary
                     }
                     defaultOption={'보조 장르를 선택해 주세요.'} 
                  />
               </div>

               <div>
                  <span>성향 선택</span>
                  <TagCheckBoxGroup tagKeys={tagKeys} setTagKeys={setTagKeys} list={initialTags} />
               </div>

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
               <SubmitBtn content={'취소'} submit={false} onClick={()=> cancelWrite()}/>
               <SubmitBtn content={edit ? '수정 완료' : '작성 완료'} onClick={(e)=> {handleSubmit(e)}}/>
            </div>
         </form>
      </section>
   )
}