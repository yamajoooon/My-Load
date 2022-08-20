import {
  collection,
  getDocs,
  getFirestore,
  getDoc,
  doc,
} from 'firebase/firestore';

type Marker = {
  city: string;
  country: string;
  latCoord: number;
  longCoord: number;
  color: string;
};

export type Post = {
  id: string;
  title: string;
  centerLng: number;
  centerLat: number;
  basicZoom: number;
  markers: Marker[];
};

export async function getPost(uid: string | undefined): Promise<Post> {
  const db = getFirestore();

  const docRef = doc(db, `/users/${uid}/posts`, '5Fwd6fQXpIV6hW4mS9FQ');

  const getPostSnap = await getDoc(docRef);

  const post = getPostSnap.data() as Post;

  return post;
}
