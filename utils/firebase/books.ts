import { Book } from '@mui/icons-material';
import { collection, getDocs, getFirestore, addDoc } from 'firebase/firestore';

export type Book = {
  id: string;
  title: string;
  auther: string;
};

export async function getBooks(uid: string | undefined): Promise<Book[]> {
  const books = new Array<Book>();
  const db = getFirestore();

  const booksSnapshot = await getDocs(collection(db, `/users/${uid}/books`));

  booksSnapshot.forEach((doc) => {
    const book = doc.data() as Book;
    books.push({ ...book, id: doc.id });
  });

  return books;
}

export async function addBook(
  book: Book,
  uid: string | undefined
): Promise<void> {
  const db = getFirestore();

  const docRef = collection(db, `/users/${uid}/books`);
  const documentRef = await addDoc(docRef, book);

  console.log('Document written with ID: ', documentRef.id);
}
