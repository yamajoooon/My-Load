import { Client, auth } from 'twitter-api-sdk';

const authClient = new auth.OAuth2User({
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID as string,
  client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET as string,
  callback: 'http://localhost:3000/api/callback',
  scopes: ['tweet.read', 'users.read'],
});

const client = new Client(authClient);

export default async function getHomeTimeline(req, res) {
  try {
    const response = await client.tweets.usersIdTimeline('1567915394400415745');

    console.log('response', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    console.log('tweets error', error);
  }
}
