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
import { getApp, FirebaseApp } from 'firebase/app';
import { CurrentCoordinate } from './test-map-box.style';

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
  const [currentLng, setCurrentLng] = useState<number>(135.7818);
  const [currentLat, setCurrentLat] = useState<number>(35.0);
  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const app: FirebaseApp = getApp();

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    // mapContainer.currentはnullになり得るので型ガード（ていねい）
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current, // ていねいな型ガードのおかげで必ずHTMLDivElementとして扱える、current!でも可
      accessToken: mapboxAccessToken,
      style: mapStyle,
      center: [currentLng, currentLat],
      zoom: currentZoom,
    });
    // mapboxgl.Mapのインスタンスへの参照を保存
    setMapInstance(map);
  }, []);

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

  const markers = [
    {
      city: 'Kenninji',
      country: 'Japan',
      latCoord: 35.00028883396185,
      longCoord: 135.77350069157626,
      color: 'red',
    },
    {
      city: 'NaZenji',
      country: 'Japan',
      latCoord: 35.0107325368728,
      longCoord: 135.7940018972439,
      color: 'pink',
    },
    {
      city: 'Shimogamojinja',
      country: 'Japan',
      latCoord: 35.0397503053051,
      longCoord: 135.7691401418707,
      color: 'blue',
    },
  ];

  const geojson = {
    type: 'Feature',
    features: markers.map((marker) => ({
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
    })),
  };

  const start = [markers[0].longCoord, markers[0].latCoord];

  const getRoute = useCallback(async () => {
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${markers[0].longCoord},${markers[0].latCoord};${markers[1].longCoord},${markers[1].latCoord};${markers[2].longCoord},${markers[2].latCoord}?steps=true&geometries=geojson&access_token=${mapboxAccessToken}`,
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
  }, [mapboxAccessToken, start]);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.on('load', () => {
        geojson.features.forEach((marker) => {
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
  }, [mapInstance]);

  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <ul>
            <li>name = {app.name}</li>
            <li>appId = {app.options.appId}</li>
            <li>apiKey = {app.options.apiKey}</li>
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
