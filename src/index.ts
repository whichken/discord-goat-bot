// Set up the environment
import dotenv from "dotenv"
dotenv.config()

import { Client, MessageAttachment } from "discord.js"
import { Gif } from "./gif"

const client = new Client()
const gif = new Gif()

client.once('ready', () => {
  console.log('Ready')
})

client.on('message', async message => {
  if (message.content.startsWith("!gif ")) {
    message.channel.startTyping()
    const url = await gif.search(message.content.replace("!gif ", ""))
    if (url) {
      const attachment = new MessageAttachment(url)
      attachment.name = "attachment.gif"
      message.channel.send(attachment)
    }
    message.channel.stopTyping(true)
  }
})

client.login(process.env.BOT_TOKEN)
