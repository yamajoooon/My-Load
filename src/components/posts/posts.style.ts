import { styled } from '@mui/material/styles';

const Container = styled('div')(({ theme }) => ({
  width: '800px',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginTop: theme.spacing(12),
}));

const CardContainer = styled('div')(({ theme }) => ({
  ':hover': {
    cursor: 'pointer',
    backgroundColor: '#fafad2',
  },
}));

export { Container, CardContainer };
