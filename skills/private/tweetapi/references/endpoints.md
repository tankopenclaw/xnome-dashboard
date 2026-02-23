# TweetAPI Endpoint Reference (auto-extracted)

Source: https://www.tweetapi.com/docs
Total extracted endpoints: 69

## auth

### `POST /tw-v2/auth/login`
- Doc: https://www.tweetapi.com/docs/auth/login
- Title: Login - TweetAPI Documentation
- Description: Authenticate a Twitter/X account and retrieve session cookies for use with interaction endpoints. Rate limited to 60 requests per minute.

## community

### `GET /tw-v2/community/details`
- Doc: https://www.tweetapi.com/docs/community/details
- Title: Details - TweetAPI Documentation
- Description: Get detailed information about a specific Twitter community including metadata, member count, and settings.
- Parameters:
  - `communityId` (string, required): Unique Twitter community ID

### `GET /tw-v2/community/members`
- Doc: https://www.tweetapi.com/docs/community/members
- Title: Members - TweetAPI Documentation
- Description: Get a paginated list of members in a Twitter/X community.
- Parameters:
  - `communityId` (string, required): Unique Twitter community ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/community/search`
- Doc: https://www.tweetapi.com/docs/community/search
- Title: Search - TweetAPI Documentation
- Description: Search for Twitter communities by keyword. Returns a list of communities matching the search query with basic information like name, member count, and topic.
- Parameters:
  - `query` (string, required): Search query string to find communities
  - `cursor` (string, optional): Pagination cursor for fetching next page of results

### `GET /tw-v2/community/tweets`
- Doc: https://www.tweetapi.com/docs/community/tweets
- Title: Tweets - TweetAPI Documentation
- Description: Retrieve tweets from a specific Twitter community. Returns a paginated timeline of community tweets with configurable sorting.
- Parameters:
  - `communityId` (string, required): Unique Twitter community ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.
  - `sortBy` (string, required): Sort order for results (Relevance, Recency)

## explore

### `GET /tw-v2/search`
- Doc: https://www.tweetapi.com/docs/explore/search
- Title: Search - TweetAPI Documentation
- Description: Search for tweets, users, or other content on Twitter/X. Supports various search operators and filters.
- Parameters:
  - `query` (string, required): Search query string. Supports Twitter search operators.
  - `type` (string, required): Type of search results (Latest, Top, People, Photos, Videos)
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

## interaction

### `POST /tw-v2/interaction/add-to-list`
- Doc: https://www.tweetapi.com/docs/interaction/add-member-to-list
- Title: Add Member To List - TweetAPI Documentation
- Description: Add a user to a Twitter list.

### `POST /tw-v2/interaction/bookmark`
- Doc: https://www.tweetapi.com/docs/interaction/bookmark
- Title: Bookmark - TweetAPI Documentation
- Description: Add a tweet to your bookmarks for later viewing.

### `GET /tw-v2/interaction/conversation`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/conversation
- Title: Conversation - TweetAPI Documentation
- Description: Get messages from a specific DM conversation. Returns conversation details, messages, and user data. Supports pagination with cursor for loading message history.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `conversationId` (string, required): Conversation ID. For 1-on-1 conversations: 'userId1-userId2' (e.g., '123456789-987654321'). For group conversations: single conversation ID (e.g., '1234567890')
  - `cursor` (string, optional): Pagination cursor for loading older messages. Obtained from previous response.
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `POST /tw-v2/interaction/create-community-post`
- Doc: https://www.tweetapi.com/docs/community/create-community-post
- Title: Create Post - TweetAPI Documentation
- Description: Post a new tweet to a specific Twitter/X community. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/create-community-post-with-media`
- Doc: https://www.tweetapi.com/docs/community/create-community-post-with-media
- Title: Create Post With Media - TweetAPI Documentation
- Description: Post a new tweet with media attachments to a specific Twitter/X community. Supports text content up to 280 characters for non-premium users (or 25,000 for premium users) and up to 4 images or 1 video.

### `POST /tw-v2/interaction/create-post`
- Doc: https://www.tweetapi.com/docs/post/create-post
- Title: Create Post - TweetAPI Documentation
- Description: Post a new tweet to Twitter/X. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/create-post-quote`
- Doc: https://www.tweetapi.com/docs/post/create-post-quote
- Title: Create Post Quote - TweetAPI Documentation
- Description: Quote tweet another tweet with your own commentary. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/create-post-with-media`
- Doc: https://www.tweetapi.com/docs/post/create-post-with-media
- Title: Create Post With Media - TweetAPI Documentation
- Description: Post a new tweet with media attachments to Twitter/X. Supports text content up to 280 characters for non-premium users (or 25,000 for premium users) and up to 4 images or 1 video.

### `POST /tw-v2/interaction/delete-bookmark`
- Doc: https://www.tweetapi.com/docs/interaction/delete-bookmark
- Title: Delete Bookmark - TweetAPI Documentation
- Description: Remove a tweet from your bookmarks.

### `POST /tw-v2/interaction/delete-post`
- Doc: https://www.tweetapi.com/docs/post/delete-post
- Title: Delete Post - TweetAPI Documentation
- Description: Delete a tweet posted by the authenticated user.

### `POST /tw-v2/interaction/delete-retweet`
- Doc: https://www.tweetapi.com/docs/interaction/delete-retweet
- Title: Delete Retweet - TweetAPI Documentation
- Description: Remove a retweet (unretweet) on behalf of an authenticated user. This endpoint allows you to programmatically undo a retweet using the user's authentication token.

### `GET /tw-v2/interaction/dm-permissions`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/dm-permissions
- Title: DM Permissions - TweetAPI Documentation
- Description: Check if you can send direct messages to specific Twitter users. Verifies DM permissions for up to 50 recipient IDs at once.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `recipientIds` (string, required): Comma-separated list of user IDs to check (max 50 IDs, e.g., '123456789,987654321')
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `GET /tw-v2/interaction/dm-user-updates`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/dm-user-updates
- Title: DM User Updates - TweetAPI Documentation
- Description: Poll for new DM updates and changes. Use the cursor from inbox-initial-state or previous dm-user-updates response to check for new messages, conversations, and updates. Ideal for real-time DM monitoring.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `cursor` (string, required): Update cursor from inbox-initial-state or previous dm-user-updates response. Required for polling.
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `POST /tw-v2/interaction/follow`
- Doc: https://www.tweetapi.com/docs/interaction/follow
- Title: Follow - TweetAPI Documentation
- Description: Follow a Twitter/X user account.

### `GET /tw-v2/interaction/inbox-initial-state`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/inbox-initial-state
- Title: Inbox Initial State - TweetAPI Documentation
- Description: Get the initial state of your Twitter DM inbox. Returns conversations, messages, user data, and inbox timeline cursors for pagination. Use the returned cursor for polling updates via dm-user-updates endpoint.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `GET /tw-v2/interaction/inbox-timeline-trusted`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/inbox-timeline-trusted
- Title: Inbox Trusted - TweetAPI Documentation
- Description: Get paginated trusted conversations timeline. Use the cursor from inbox-initial-state or previous response to fetch next page of trusted DM conversations.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `cursor` (string, required): Cursor for pagination. Get from inbox-initial-state or previous response.
  - `filterLowQuality` (boolean, optional): Filter out low quality conversations (default false)
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `GET /tw-v2/interaction/inbox-timeline-untrusted`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/inbox-timeline-untrusted
- Title: Inbox Untrusted - TweetAPI Documentation
- Description: Get paginated untrusted/filtered conversations timeline. Use the cursor from inbox-initial-state or previous response to fetch next page of untrusted DM conversations (message requests).
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `cursor` (string, required): Cursor for pagination. Get from inbox-initial-state or previous response.
  - `filterLowQuality` (boolean, optional): Filter out low quality conversations (default false)
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `POST /tw-v2/interaction/join-community`
- Doc: https://www.tweetapi.com/docs/community/join-community
- Title: Join - TweetAPI Documentation
- Description: Join a Twitter/X community. Returns community details including name, description, member count, and your role after joining.

### `POST /tw-v2/interaction/leave-community`
- Doc: https://www.tweetapi.com/docs/community/leave-community
- Title: Leave - TweetAPI Documentation
- Description: Leave a Twitter/X community. Returns community details including name, description, and member count after leaving.

### `POST /tw-v2/interaction/like-post`
- Doc: https://www.tweetapi.com/docs/interaction/favorite-post
- Title: Favorite Post - TweetAPI Documentation
- Description: Like a tweet on behalf of an authenticated user.

### `GET /tw-v2/interaction/notifications`
- Doc: https://www.tweetapi.com/docs/interaction/notifications
- Title: Notifications - TweetAPI Documentation
- Description: Retrieve the authenticated user's notifications timeline on Twitter/X. Returns notifications including likes, retweets, mentions, and follows.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `timelineType` (string, optional): Type of notifications to retrieve: 'All', 'Verified', or 'Mentions' (default: 'All')
  - `count` (number, optional): Number of results to return per page (min: 1, max: 100, default: 20)
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

### `POST /tw-v2/interaction/remove-from-list`
- Doc: https://www.tweetapi.com/docs/interaction/remove-member-from-list
- Title: Remove Member From List - TweetAPI Documentation
- Description: Remove a user from a Twitter list.

### `POST /tw-v2/interaction/reply-community-post`
- Doc: https://www.tweetapi.com/docs/community/reply-community-post
- Title: Reply To Post - TweetAPI Documentation
- Description: Reply to an existing tweet within a Twitter/X community. Creates a reply in the conversation thread with community context. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/reply-community-post-with-media`
- Doc: https://www.tweetapi.com/docs/community/reply-community-post-with-media
- Title: Reply To Post With Media - TweetAPI Documentation
- Description: Reply to an existing tweet within a Twitter/X community with media attachments. Creates a reply in the conversation thread with community context and up to 4 images or 1 video. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/reply-post`
- Doc: https://www.tweetapi.com/docs/post/reply-post
- Title: Reply Post - TweetAPI Documentation
- Description: Reply to an existing tweet. Creates a tweet in the conversation thread. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/reply-post-with-media`
- Doc: https://www.tweetapi.com/docs/post/reply-post-with-media
- Title: Reply Post With Media - TweetAPI Documentation
- Description: Reply to an existing tweet with media attachments. Creates a tweet in the conversation thread with up to 4 images or 1 video. Supports text content up to 280 characters for non-premium users, or 25,000 characters for premium users.

### `POST /tw-v2/interaction/retweet`
- Doc: https://www.tweetapi.com/docs/interaction/retweet
- Title: Retweet - TweetAPI Documentation
- Description: Retweet a tweet on behalf of an authenticated user. This endpoint allows you to programmatically retweet any public tweet using the user's authentication token.

### `POST /tw-v2/interaction/send-dm`
- Doc: https://www.tweetapi.com/docs/unencrypted-dm/send-dm
- Title: Send DM - TweetAPI Documentation
- Description: Send a direct message to a Twitter user with optional media attachment. Supports images, GIFs, and videos with automatic type detection and processing. Maximum 1 media item per DM.

### `POST /tw-v2/interaction/unfollow`
- Doc: https://www.tweetapi.com/docs/interaction/unfollow
- Title: Unfollow - TweetAPI Documentation
- Description: Unfollow a Twitter/X user account.

### `POST /tw-v2/interaction/unlike-post`
- Doc: https://www.tweetapi.com/docs/interaction/unfavorite-post
- Title: Unfavorite Post - TweetAPI Documentation
- Description: Unlike a tweet on behalf of an authenticated user.

### `GET /tw-v2/interaction/user-analytics`
- Doc: https://www.tweetapi.com/docs/interaction/user-analytics
- Title: User Analytics - TweetAPI Documentation
- Description: Get detailed analytics for a user including engagement rates and growth metrics.
- Parameters:
  - `authToken` (string, required): Twitter authentication token (auth_token cookie value)
  - `toTime` (string, optional): End time for analytics period in ISO 8601 format (default: current time)
  - `fromTime` (string, optional): Start time for analytics period in ISO 8601 format (default: 30 days ago)
  - `granularity` (string, optional): Time granularity for metrics: Daily, Weekly, or Monthly (default: Daily)
  - `showVerifiedFollowers` (boolean, optional): Include verified follower metrics (default: true)
  - `proxy` (string, optional): Optional proxy in format 'host:port@user:pass'

## list

### `GET /tw-v2/list/details`
- Doc: https://www.tweetapi.com/docs/list/details
- Title: Details - TweetAPI Documentation
- Description: Get detailed information about a specific Twitter list including metadata, member count, and configuration settings.
- Parameters:
  - `listId` (string, required): Unique Twitter list ID

### `GET /tw-v2/list/followers`
- Doc: https://www.tweetapi.com/docs/list/followers
- Title: Followers - TweetAPI Documentation
- Description: Get a paginated list of users following a specific Twitter list. Returns user objects with complete profile information.
- Parameters:
  - `listId` (string, required): Unique Twitter list ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/list/members`
- Doc: https://www.tweetapi.com/docs/list/members
- Title: Members - TweetAPI Documentation
- Description: Get a paginated list of members in a Twitter/X list.
- Parameters:
  - `listId` (string, required): Unique Twitter list ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/list/tweets`
- Doc: https://www.tweetapi.com/docs/list/tweets
- Title: Tweets - TweetAPI Documentation
- Description: Retrieve tweets from a specific Twitter list. Returns a paginated timeline of tweets posted by list members.
- Parameters:
  - `listId` (string, required): Unique Twitter list ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

## space

### `GET /tw-v2/space/by-id`
- Doc: https://www.tweetapi.com/docs/space/by-id
- Title: By ID - TweetAPI Documentation
- Description: Retrieve detailed information about a Twitter Space (audio room) by its ID. Returns comprehensive data including title, state, creator, participants, topics, and engagement stats.
- Parameters:
  - `spaceId` (string, required): Unique Space ID (e.g., '1MnxnPmLRQBGO')

### `GET /tw-v2/space/stream-url`
- Doc: https://www.tweetapi.com/docs/space/stream-url
- Title: Stream URL - TweetAPI Documentation
- Description: Get the audio stream URL for a Twitter Space. Returns an HLS stream URL that can be used to listen to the Space audio. The mediaKey can be obtained from the Space details endpoint.
- Parameters:
  - `mediaKey` (string, required): Media key of the Space (obtained from the space by-id endpoint's mediaKey field)

## tweet

### `GET /tw-v2/tweet/details`
- Doc: https://www.tweetapi.com/docs/tweet/details--conversation
- Title: Details &amp; Conversation - TweetAPI Documentation
- Description: Get detailed information about a specific tweet including full metadata, engagement metrics, and conversation context.
- Parameters:
  - `tweetId` (string, required): Unique tweet/post ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.
  - `sortBy` (string, optional): Sort order for conversation replies (Relevance, Recency, Likes). Default: Relevance

### `GET /tw-v2/tweet/details-by-ids`
- Doc: https://www.tweetapi.com/docs/tweet/details-by-ids
- Title: Details By IDs - TweetAPI Documentation
- Description: Retrieve detailed information for multiple tweets in a single request. Returns comprehensive tweet data including author information, engagement metrics, media attachments, and metadata for up to 200 tweets at once.
- Parameters:
  - `ids` (string, required): Comma-separated list of tweet IDs to retrieve (maximum 200 IDs per request)

### `GET /tw-v2/tweet/quotes`
- Doc: https://www.tweetapi.com/docs/tweet/quotes
- Title: Quotes - TweetAPI Documentation
- Description: Retrieve quote tweets for a specific tweet. Returns tweets that quote the original tweet with additional commentary.
- Parameters:
  - `tweetId` (string, required): Unique tweet/post ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/tweet/retweets`
- Doc: https://www.tweetapi.com/docs/tweet/retweets
- Title: Retweets - TweetAPI Documentation
- Description: Retrieve users who retweeted a specific tweet. Returns a paginated list of retweets with user information.
- Parameters:
  - `tweetId` (string, required): Unique tweet/post ID
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `POST /tw-v2/tweet/translate`
- Doc: https://www.tweetapi.com/docs/tweet/translate
- Title: Translate - TweetAPI Documentation
- Description: Translate tweet text to a target language using Twitter's translation service.

## user

### `GET /tw-v2/user/about-account`
- Doc: https://www.tweetapi.com/docs/user/about-account
- Title: About Account - TweetAPI Documentation
- Description: Retrieve detailed account information for a Twitter/X user including location, verification details, username history, affiliate relationships, and account creation source.
- Parameters:
  - `username` (string, required): Twitter/X username without @ symbol (e.g., 'elonmusk')

### `GET /tw-v2/user/by-id`
- Doc: https://www.tweetapi.com/docs/user/by-user-id
- Title: By User ID - TweetAPI Documentation
- Description: Retrieve comprehensive user profile information using a Twitter/X user ID. Returns detailed user data including statistics, verification status, and profile metadata.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')

### `GET /tw-v2/user/by-ids`
- Doc: https://www.tweetapi.com/docs/user/by-user-ids
- Title: By User IDs - TweetAPI Documentation
- Description: Retrieve comprehensive user profile information using a Twitter/X user ID. Returns detailed user data including statistics, verification status, and profile metadata.
- Parameters:
  - `userIds` (string, required): Array of Twitter/X user IDs to retrieve

### `GET /tw-v2/user/by-username`
- Doc: https://www.tweetapi.com/docs/user/by-username
- Title: By Username - TweetAPI Documentation
- Description: Retrieve comprehensive user profile information using a Twitter/X username. Returns detailed user data including statistics, verification status, and profile metadata.
- Parameters:
  - `username` (string, required): Twitter/X username without @ symbol (e.g., 'elonmusk')

### `GET /tw-v2/user/by-usernames`
- Doc: https://www.tweetapi.com/docs/user/by-usernames
- Title: By Usernames - TweetAPI Documentation
- Description: Retrieve comprehensive user profile information for multiple users in a single request using their Twitter/X usernames. Returns detailed user data including statistics, verification status, and profile metadata for up to 200 users at once.
- Parameters:
  - `usernames` (string, required): Comma-separated list of Twitter/X usernames without @ symbol (maximum 200 usernames per request). The @ symbol is automatically stripped if provided.

### `GET /tw-v2/user/followers`
- Doc: https://www.tweetapi.com/docs/user/followers-v2
- Title: Followers - TweetAPI Documentation
- Description: Get a paginated list of users following the specified account. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/followers-ids`
- Doc: https://www.tweetapi.com/docs/user/followers-ids
- Title: Followers IDs - TweetAPI Documentation
- Description: Get a paginated list of users following the specified account. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `count` (string, optional): Number of results to return per page (max: 100, default: 20)
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/followers-list`
- Doc: https://www.tweetapi.com/docs/user/followers-v1
- Title: Followers (v1) - TweetAPI Documentation
- Description: Get a paginated list of users following the specified account. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `count` (string, optional): Number of results to return per page (max: 100, default: 20)
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/following`
- Doc: https://www.tweetapi.com/docs/user/following-v2
- Title: Following - TweetAPI Documentation
- Description: Get a paginated list of users that the specified account is following. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/following-ids`
- Doc: https://www.tweetapi.com/docs/user/following-ids
- Title: Following IDs - TweetAPI Documentation
- Description: Get a paginated list of users that the specified account is following. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `count` (string, optional): Number of results to return per page (max: 100, default: 20)
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/following-list`
- Doc: https://www.tweetapi.com/docs/user/following-v1
- Title: Following (v1) - TweetAPI Documentation
- Description: Get a paginated list of users that the specified account is following. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `count` (string, optional): Number of results to return per page (max: 100, default: 20)
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/friendship`
- Doc: https://www.tweetapi.com/docs/user/check-follow
- Title: Check Follow - TweetAPI Documentation
- Description: Check if a follow relationship exists between two Twitter/X users.
- Parameters:
  - `subjectId` (string, required): The user ID of the subject user (the follower)
  - `targetId` (string, required): The user ID of the target user (the one being followed)

### `GET /tw-v2/user/subscriptions`
- Doc: https://www.tweetapi.com/docs/user/subscriptions
- Title: Subscriptions - TweetAPI Documentation
- Description: Get a list of accounts that the user has subscribed to. Includes Twitter Blue subscribers and Super Followers.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/tweets`
- Doc: https://www.tweetapi.com/docs/user/tweets
- Title: Tweets - TweetAPI Documentation
- Description: Retrieve tweets posted by a specific user. Returns a paginated timeline of original tweets (no replies).
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/tweets-and-replies`
- Doc: https://www.tweetapi.com/docs/user/tweets-and-replies
- Title: Tweets &amp; Replies - TweetAPI Documentation
- Description: Retrieve tweets and replies posted by a specific user. Returns a paginated timeline including both original tweets and replies.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

### `GET /tw-v2/user/verified-followers`
- Doc: https://www.tweetapi.com/docs/user/verified-followers
- Title: Verified Followers - TweetAPI Documentation
- Description: Get a paginated list of users following the specified account. Returns user objects with complete profile information.
- Parameters:
  - `userId` (string, required): Unique Twitter/X user ID (e.g., '44196397')
  - `cursor` (string, optional): Pagination cursor for fetching next page of results. Obtained from previous response.

## xchat

### `POST /tw-v2/xchat/can-dm`
- Doc: https://www.tweetapi.com/docs/xchat/can-dm
- Title: Check Can DM - TweetAPI Documentation
- Description: Check if users can receive X Chat encrypted DMs. Returns chat permissions including whether they have X Chat enabled and a public key for encryption. Use this endpoint to verify recipients before attempting to send encrypted messages.

### `POST /tw-v2/xchat/conversations`
- Doc: https://www.tweetapi.com/docs/xchat/conversations
- Title: List Conversations - TweetAPI Documentation
- Description: Get a list of all X Chat conversations in your inbox. Returns conversation metadata including participants and timestamps. This endpoint does not require /xchat/setup since it only returns metadata, not decrypted message content.

### `POST /tw-v2/xchat/history`
- Doc: https://www.tweetapi.com/docs/xchat/history
- Title: Conversation History - TweetAPI Documentation
- Description: Get decrypted conversation history for an end-to-end encrypted X Chat conversation. Returns messages in decrypted plaintext with metadata. Prerequisite - You must call /xchat/setup first before fetching history.

### `POST /tw-v2/xchat/send`
- Doc: https://www.tweetapi.com/docs/xchat/send
- Title: Send Message - TweetAPI Documentation
- Description: Send an end-to-end encrypted direct message via X Chat. Prerequisite - You must call /xchat/setup first before sending messages.

### `POST /tw-v2/xchat/setup`
- Doc: https://www.tweetapi.com/docs/xchat/setup
- Title: Setup - TweetAPI Documentation
- Description: Initialize X Chat (encrypted DMs) for your account. This is a required first step before sending encrypted messages. You must have X Chat already set up in the official X app before using this endpoint.

