import { collection, getDocs, getFirestore } from 'firebase/firestore';

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
