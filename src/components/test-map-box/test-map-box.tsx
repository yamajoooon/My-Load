import { FunctionComponent, useEffect, useRef, useState } from 'react';
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
      maxzoom: 18,
    },
  ],
};

export const TestMapBox: FunctionComponent = () => {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map>();
  const [currentLng, setCurrentLng] = useState<number>(142.0);
  const [currentLat, setCurrentLat] = useState<number>(40.0);
  const [currentZoom, setCurrentZoom] = useState<number>(4);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const app: FirebaseApp = getApp();

  useEffect(() => {
    // mapContainer.currentはnullになり得るので型ガード（ていねい）
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current, // ていねいな型ガードのおかげで必ずHTMLDivElementとして扱える、current!でも可
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
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
        color: marker.color,
      },
    })),
  };

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
            .addTo(mapInstance);
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
