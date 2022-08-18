import { FunctionComponent, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { getApp, FirebaseApp } from 'firebase/app';

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
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const app: FirebaseApp = getApp();

  useEffect(() => {
    // mapContainer.currentはnullになり得るので型ガード（ていねい）
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current, // ていねいな型ガードのおかげで必ずHTMLDivElementとして扱える、current!でも可
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      style: mapStyle,
      center: [142.0, 40.0],
      zoom: 4,
    });
    // mapboxgl.Mapのインスタンスへの参照を保存
    setMapInstance(map);
  }, []);

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
      <div style={{ height: 800 }} ref={mapContainer} />
    </div>
  );
};
