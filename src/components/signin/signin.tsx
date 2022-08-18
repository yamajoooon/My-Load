import { FunctionComponent } from 'react';
import {
  getAuth,
  EmailAuthProvider,
  // FacebookAuthProvider,
  GoogleAuthProvider,
  // TwitterAuthProvider,
} from 'firebase/auth';
import { auth } from 'firebaseui';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const uiConfig: auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    // FacebookAuthProvider.PROVIDER_ID,
    GoogleAuthProvider.PROVIDER_ID,
    // TwitterAuthProvider.PROVIDER_ID,
  ],
  signInSuccessUrl: '/test-map-box',
};

export const SignIn: FunctionComponent = () => {
  return <StyledFirebaseAuth firebaseAuth={getAuth()} uiConfig={uiConfig} />;
};
