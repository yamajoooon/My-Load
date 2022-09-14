import {
  collection,
  getDocs,
  getFirestore,
  getDoc,
  doc,
  addDoc,
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
  travelDay: any;
  lineColor: string;
};

export async function getPost(
  uid: string | undefined,
  postId: string | undefined
): Promise<Post> {
  const db = getFirestore();

  const docRef = doc(db, `/users/${uid}/posts`, postId);

  const getPostSnap = await getDoc(docRef);

  const post = getPostSnap.data() as Post;

  return post;
}

export async function getPosts(uid: string | undefined): Promise<Post[]> {
  const posts = new Array<Post>();
  const db = getFirestore();
  const postsSnapshot = await getDocs(collection(db, `/users/${uid}/posts`));

  postsSnapshot.forEach((doc) => {
    const post = doc.data() as Post;
    posts.push({ ...post, id: doc.id });
  });

  return posts;
}

export async function addPost(
  uid: string | undefined,
  post: Post
): Promise<void> {
  const db = getFirestore();

  const docRef = collection(db, `/users/${uid}/posts`);
  await addDoc(docRef, post)
    .then((docRef) => {
      console.log('Document has been added successfully:', docRef.id);
    })
    .catch((error) => {
      console.log(error);
    });
}
