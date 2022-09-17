import { auth, Client } from 'twitter-api-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const authClient = new auth.OAuth2User({
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID as string,
  client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET as string,
  callback: 'http://localhost:3000/api/callback',
  scopes: ['tweet.read', 'users.read'],
});

const STATE = 'my-state';

export default async function getTimeline(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { code, state } = req.query;
    console.log(code, state);
    if (state !== STATE) return res.status(500).send("State isn't matching");
    authClient.generateAuthURL({
      state: STATE,
      code_challenge: 'code_challenge',
      code_challenge_method: 'plain',
    });
    await authClient.requestAccessToken(code as string);

    const client = new Client(authClient);

    const response = await client.tweets.usersIdTimeline('1567915394400415745');

    console.log('response', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}
