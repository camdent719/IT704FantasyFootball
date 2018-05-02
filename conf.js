const clientId = process.env.CLIENT_ID ||
  'dj0yJmk9TTRXUDZTdE0wbkw0JmQ9WVdrOVEzVlFhRzgyTXpZbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1hMw--'

const clientSecret = process.env.CLIENT_SECRET ||
  '4f7f63ad65db8ee6fad99a8dc5a477bd9ff51e08'

const redirectUri = process.env.REDIRECT_URI ||
  'http://it704.herokuapp.com/auth/test/callback'

module.exports = {
  clientId,
  clientSecret,
  redirectUri
}