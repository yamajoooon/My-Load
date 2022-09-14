import {
  FunctionComponent,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { CurrentCoordinate } from './create.style';
import { useAuthState } from '../../common/components/header/hooks/useAuthState';
import { addBook } from '../../../utils/firebase/books';
import { usePost } from '../post/hooks';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/router';

const mapStyle: mapboxgl.Style = {
  version: 8,
  sprite: 'mapbox://styles/arakiken/cl6zste8x005n14nxa4qaarc7',
  sources: {
    OSM: {
      type: 'raster',
      tiles: ['http://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '<a href="http://osm.org/copyright">© OpenStreetMap contributors</a>',
    },
  },
  layers: [
    {
      id: 'OSM',
      type: 'raster',
      source: 'OSM',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const Create: FunctionComponent = () => {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map>();
  const [currentCenterLng, setCurrentCenterLng] = useState<number>(134.7818);
  const [currentCenterLat, setCurrentCenterLat] = useState<number>(36.0);
  const [currentZoom, setCurrentZoom] = useState<number>(11);
  const [currentCity, setCurrentCity] = useState();
  const [currentSelectedLng, setCurrentSelectedLng] =
    useState<number>(134.7818);
  const [currentSelectedLat, setCurrentSelectedLat] = useState<number>(36.0);

  const mapContainer = useRef<HTMLDivElement | null>(null);

  const { userId } = useAuthState();

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const { isLoadingPost, post, loadQuery, markerGeo, start } = usePost();

  const router = useRouter();

  useEffect(() => {
    if (!mapContainer.current) return;

    if (post) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        accessToken: mapboxAccessToken,
        style: mapStyle,
        center: [post.centerLng, post.centerLat],
        zoom: post.basicZoom,
      });

      setMapInstance(map);
    }
  }, [post, loadQuery]);

  const getCity = useCallback(
    async (selectedLat: number, selectedLong: number) => {
      const query = await fetch(
        `https://api.mapbox.com/search/v1/reverse/${selectedLong},${selectedLat}?language=ja&access_token=${mapboxAccessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      const data = json.features[0];
      const length = data.properties.context.length;
      const city = data.properties.context[length - 3].name;
      setCurrentCity(city);
    },
    [mapboxAccessToken]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    if (mapInstance) {
      mapInstance.on('move', () => {
        setCurrentCenterLng(Number(mapInstance.getCenter().lng.toFixed(4)));
        setCurrentCenterLat(Number(mapInstance.getCenter().lat.toFixed(4)));
        setCurrentZoom(Number(mapInstance.getZoom().toFixed(2)));
      });

      const marker = new mapboxgl.Marker();

      mapInstance.on('click', function (e) {
        const lat = e.lngLat.lat;
        const lng = e.lngLat.lng;

        setCurrentSelectedLat(lat);
        setCurrentSelectedLng(lng);
        //経緯度表示

        marker.setLngLat(e.lngLat).addTo(mapInstance);

        getCity(lat, lng);
      });
    }
  }, [mapInstance]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { auther, title } = event.target.elements;
    console.log(auther.value, title.value);
    const rand = Math.floor(Math.random() * 10000000000).toString();
    addBook({ id: rand, auther: auther.value, title: title.value }, userId);
    router.push('/posts');
  };

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <CurrentCoordinate>
          Longitude: {currentCenterLng} | Latitude: {currentCenterLat} | Zoom:
          {currentZoom}
        </CurrentCoordinate>
        <div style={{ height: 1000, width: 800 }} ref={mapContainer} />
      </div>
      <div>
        <div>{currentCity}</div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>日程</label>
            <input name='auther' type='text' placeholder='作者' />
          </div>
          <div>
            <label>タイトル</label>
            <input name='title' type='text' placeholder='タイトル' />
          </div>
          <div>
            <button>登録</button>
          </div>
        </form>
      </div>
    </div>
  );
};
