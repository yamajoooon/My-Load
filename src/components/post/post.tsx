import {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useRouter } from 'next/router';
import { Container } from './post.style';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  Typography,
} from '@mui/material';
import { red } from '@mui/material/colors';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import { useAuthState } from '../../common/components/header/hooks/useAuthState';
import { usePost } from './hooks';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type ExpandMoreProps = IconButtonProps & {
  expand: boolean;
};

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

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

export const Post: FunctionComponent = () => {
  const [expanded, setExpanded] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map>();
  const [currentLng, setCurrentLng] = useState<number>(134.7818);
  const [currentLat, setCurrentLat] = useState<number>(36.0);
  const [currentZoom, setCurrentZoom] = useState<number>(11);
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const { postId } = router.query;

  const { userName } = useAuthState();
  const { isLoadingPost, post, loadQuery, markerGeo, start } = usePost();

  const handleExpandClick = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

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
  }, [mapInstance, start]);

  return (
    <Container>
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label='recipe'>
              {userName && userName.charAt(0)}
            </Avatar>
          }
          action={
            <IconButton aria-label='settings'>
              <MoreVertIcon />
            </IconButton>
          }
          title={postId}
          subheader='September 14, 2016'
        />
        <div style={{ height: 800 }} ref={mapContainer} />
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            This impressive paella is a perfect party dish and a fun meal to
            cook together with your guests. Add 1 cup of frozen peas along with
            the mussels, if you like.
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton aria-label='add to favorites'>
            <FavoriteIcon />
          </IconButton>
          <IconButton aria-label='share'>
            <ShareIcon />
          </IconButton>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label='show more'
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardContent>
            <Typography paragraph>Method:</Typography>
            <Typography paragraph>
              Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet
              over medium-high heat. Add chicken, shrimp and chorizo, and cook,
              stirring occasionally until lightly browned, 6 to 8 minutes.
              Transfer shrimp to a large plate and set aside, leaving chicken
              and chorizo in the pan. Add pimentón, bay leaves, garlic,
              tomatoes, onion, salt and pepper, and cook, stirring often until
              thickened and fragrant, about 10 minutes. Add saffron broth and
              remaining 4 1/2 cups chicken broth; bring to a boil.
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </Container>
  );
};
