import { FunctionComponent, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuthState } from './hooks/useAuthState';
import Router from 'next/router';
import { getAuth, signOut } from 'firebase/auth';

export const Header: FunctionComponent = () => {
  const { isSignedIn, userName } = useAuthState();

  const handleSignOut = useCallback(() => {
    signOut(getAuth());
    Router.push('/signin');
  }, []);

  return (
    <header>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
              MyLoad
            </Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              {userName && <Box sx={{ flexGrow: 1 }}>{userName}</Box>}
              {isSignedIn ? (
                <Button color='inherit' onClick={handleSignOut}>
                  Logout
                </Button>
              ) : (
                <Button color='inherit' onClick={() => Router.push('/signin')}>
                  Login
                </Button>
              )}
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
    </header>
  );
};
