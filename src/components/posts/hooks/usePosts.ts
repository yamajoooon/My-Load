import { useEffect, useState } from 'react';
import { Post, getPosts } from '../../../../utils/firebase/posts';
import { useAuthState } from '../../../common/components/header/hooks/useAuthState';

export type UsePostsOutput = {
  isLoading: boolean;
  posts: Post[];
};

const DEFAULT_OUTPUT: UsePostsOutput = {
  isLoading: true,
  posts: [],
};

export function usePosts(): UsePostsOutput {
  const [output, setOutput] = useState(DEFAULT_OUTPUT);
  const { userId } = useAuthState();

  useEffect(() => {
    void (async () => {
      const posts = await getPosts(userId);
      setOutput({ isLoading: false, posts });
    })();
  }, [userId]);

  return output;
}
