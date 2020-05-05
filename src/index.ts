// Set up the environment
import dotenv from "dotenv"
dotenv.config()

import { Client, MessageAttachment } from "discord.js"
import { Gif } from "./gif"

const client = new Client()

client.once('ready', () => {
  console.log('Ready')
})

client.on('message', async message => {
  if (message.content.startsWith("!gif ")) {
    message.channel.send('Searching.')
    const url = await new Gif().search(message.content.replace("!gif ", ""))
    if (url) {
      const attachment = new MessageAttachment(url)
      attachment.name = "attachment.gif"
      message.channel.send(attachment)
    }
  }
})

client.login(process.env.BOT_TOKEN)
