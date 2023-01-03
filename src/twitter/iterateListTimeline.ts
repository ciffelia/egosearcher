import type { TweetV1, TwitterApiReadOnly } from 'twitter-api-v2'

// A generator function which yields tweets from a list
// We don't use `listStatuses()` from `twitter-api-v2` as an iterator, because it caches tweets from previous fetches, resulting in memory leak.
async function* iterateListTimeline(
  twitterClient: Readonly<TwitterApiReadOnly>,
  listId: string,
): AsyncGenerator<TweetV1[], never, void> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const baseParams = { list_id: listId, include_rts: false }

  const initialStatus = await twitterClient.v1.listStatuses({
    ...baseParams,
    count: 1,
  })
  let sinceId = initialStatus.tweets[0]?.id_str

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const newStatuses = await twitterClient.v1.listStatuses({
      ...baseParams,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      since_id: sinceId,
      count: 200,
    })
    sinceId = newStatuses.tweets[0]?.id_str ?? sinceId
    yield newStatuses.tweets
  }
}

export { iterateListTimeline }
