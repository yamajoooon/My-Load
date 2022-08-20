import { useEffect, useState } from 'react';
import { Book, getBooks } from '../../../../utils/firebase/books';
import { useAuthState } from '../../../common/components/header/hooks/useAuthState';

export type UseBooksOutput = {
  isLoading: boolean;
  books: Book[];
};

const DEFAULT_OUTPUT: UseBooksOutput = {
  isLoading: true,
  books: [],
};

export function useBooks(): UseBooksOutput {
  const [output, setOutput] = useState(DEFAULT_OUTPUT);
  const { userId } = useAuthState();

  useEffect(() => {
    void (async () => {
      const books = await getBooks(userId);
      setOutput({ isLoading: false, books });
    })();
  }, [userId]);

  return output;
}
