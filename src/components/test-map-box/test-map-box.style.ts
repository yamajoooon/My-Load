import { styled } from '@mui/material/styles';

const CurrentCoordinate = styled('div')(({ theme }) => ({
  backgroundColor: 'rgba(35, 55, 75, 0.9)',
  color: ' #fff',
  padding: theme.spacing(1, 3),
  fontFamily: 'monospace',
  zIndex: 1,
  position: 'absolute',
  margin: theme.spacing(3),
  borderRadius: 4,
}));

export { CurrentCoordinate };
