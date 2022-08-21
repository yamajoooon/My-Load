import { styled } from '@mui/material/styles';

const Container = styled('div')(({ theme }) => ({
  width: '800px',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginTop: theme.spacing(12),
}));

export { Container };
