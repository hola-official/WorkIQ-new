const StreamChat = require("stream-chat").StreamChat;

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

function createStreamChatClient() {
  const client = new StreamChat(api_key, api_secret);
  // console.log(client)

  // Optionally set up other client configurations here

  return client;
}

module.exports = { createStreamChatClient };
