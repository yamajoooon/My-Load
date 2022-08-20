import {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CurrentCoordinate } from './test-map-box.style';
import { useBooks, usePost } from './hooks';

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

export const TestMapBox: FunctionComponent = () => {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map>();
  const [currentLng, setCurrentLng] = useState<number>(134.7818);
  const [currentLat, setCurrentLat] = useState<number>(36.0);
  const [currentZoom, setCurrentZoom] = useState<number>(11);
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const { isLoading, books } = useBooks();
  const { isLoadingPost, post, loadQuery, markerGeo, start } = usePost();

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current) return;

    if (post && loadQuery) {
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

  useEffect(() => {
    if (!mapContainer.current) return;

    if (mapInstance) {
      mapInstance.on('move', () => {
        setCurrentLng(Number(mapInstance.getCenter().lng.toFixed(4)));
        setCurrentLat(Number(mapInstance.getCenter().lat.toFixed(4)));
        setCurrentZoom(Number(mapInstance.getZoom().toFixed(2)));
      });
    }
  }, [mapInstance]);

  const getRoute = useCallback(async () => {
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${loadQuery}?steps=true&geometries=geojson&access_token=${mapboxAccessToken}`,
      { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route,
      },
    };
    if (mapInstance.getSource('route')) {
      // @ts-ignore
      mapInstance.getSource('route').setData(geojson);
    } else {
      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          // @ts-ignore
          data: geojson,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
  }, [mapboxAccessToken, loadQuery, mapInstance]);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.on('load', () => {
        markerGeo.features.forEach((marker) => {
          // create a DOM element for the marker
          const markerIcon = document.createElement('div');
          markerIcon.className = 'location-marker';
          markerIcon.style.backgroundImage = `url(/marker-icons/mapbox-marker-icon-20px-${marker.properties.color}.png)`;
          markerIcon.style.width = '20px';
          markerIcon.style.height = '30px';
          markerIcon.style.cursor = 'pointer';
          new mapboxgl.Marker(markerIcon)
            .setLngLat(marker.geometry.coordinates)
            .setPopup(
              // add pop out to map
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<p>${marker.properties.city}, ${marker.properties.country}</p>`
              )
            )
            .addTo(mapInstance);
        });

        getRoute();

        mapInstance.addLayer({
          id: 'point',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: start,
                  },
                },
              ],
            },
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#3887be',
          },
        });
      });
    }
  }, [mapInstance, start, isLoading]);

  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <ul>
            {books.map((book) => {
              return (
                <li key={book.id}>
                  {book.title} / {book.auther}
                </li>
              );
            })}
          </ul>
          <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            Word of the Day
          </Typography>
          <Typography variant='h5' component='div'>
            be
          </Typography>
          <Typography sx={{ mb: 1.5 }} color='text.secondary'>
            adjective
          </Typography>
          <Typography variant='body2'>
            well meaning and kindly.
            <br />
            {'"a benevolent smile"'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size='small'>Learn More</Button>
        </CardActions>
      </Card>
      <div>
        <CurrentCoordinate>
          Longitude: {currentLng} | Latitude: {currentLat} | Zoom: {currentZoom}
        </CurrentCoordinate>
        <div style={{ height: 800 }} ref={mapContainer} />
      </div>
    </div>
  );
};
