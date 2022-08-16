import { FunctionComponent } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { getApp, FirebaseApp } from 'firebase/app';

export const TestMapBox: FunctionComponent = () => {
  const app: FirebaseApp = getApp();

  return (
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
  );
};
