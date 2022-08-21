import { useEffect, useState } from 'react';
import { getPost, Post } from '../../../../utils/firebase/posts';
import { useAuthState } from '../../../common/components/header/hooks/useAuthState';
import { useRouter } from 'next/router';

export type UsePostOutput = {
  isLoadingPost: boolean;
  post: Post;
  loadQuery: string;
  markerGeo: {
    type: string;
    features: {
      geometry: {
        type: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      };
      properties: {
        city: string;
        country: string;
        color: string;
      };
    }[];
  };
  start: number[];
};

const DEFAULT_OUTPUT: UsePostOutput = {
  isLoadingPost: true,
  post: {
    id: '',
    title: '',
    centerLng: 135.6811,
    centerLat: 38.6769,
    basicZoom: 5,
    markers: [],
  },
  loadQuery: '',
  markerGeo: {
    type: 'Feature',
    features: [],
  },
  start: [],
};

export function usePost(): UsePostOutput {
  const [output, setOutput] = useState(DEFAULT_OUTPUT);
  const { userId } = useAuthState();
  const router = useRouter();
  const { postId } = router.query;

  useEffect(() => {
    void (async () => {
      const post = await getPost(userId, `${postId}`);

      let load = '';
      const features = new Array();

      post?.markers.forEach((marker) => {
        load += String(marker.longCoord) + ',' + String(marker.latCoord) + ';';
        features.push({
          geometry: {
            type: 'Point',
            coordinates: {
              lat: marker.latCoord,
              lng: marker.longCoord,
            },
          },
          properties: {
            city: marker.city,
            country: marker.country,
            color: marker.color,
          },
        });
      });

      const loadQuery = load.slice(0, -1);
      const markerGeo = {
        type: 'Feature',
        features: features,
      };

      const start = [post?.markers[0].longCoord, post?.markers[0].latCoord];
      setOutput({ isLoadingPost: false, post, loadQuery, markerGeo, start });
    })();
  }, [userId, postId]);
  return output;
}
