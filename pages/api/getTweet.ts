import { Client } from 'twitter-api-sdk';

export default async function handler(req, res) {
  const client = new Client(process.env.NEXT_PUBLIC_BEARER_TOKEN as string);

  const response = await client.tweets.findTweetsById({
    ids: ['1570038142228635649'],
  });

  console.log(process.env.NEXT_PUBLIC_CLIENT_ID);

  res.status(200).json(response);
}
