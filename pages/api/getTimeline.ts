import { Client } from 'twitter-api-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getTimeline(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new Client(process.env.NEXT_PUBLIC_BEARER_TOKEN as string);

  const response = await client.tweets.usersIdTweets('1567915394400415745');

  res.status(200).json(response);
}
