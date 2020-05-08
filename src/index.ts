// Set up the environment
import dotenv from "dotenv"
dotenv.config()

import { Client, MessageAttachment } from "discord.js"
import { Gif } from "./gif"
import { registerCollector } from "./collector"

const client = new Client()
const gif = new Gif()
const nsfw = new Gif(true)

client.once('ready', () => {
  console.log('Ready')

  // Start collecting all messages to feed thru the (future) neural net
  client.channels.cache.filter(channel => channel.type === "text").forEach(channel => registerCollector(channel))
})

client.on('message', async message => {
  // Ignore messages not to me, or from bots that can cause an infinite loop
  if (!message.content.startsWith('!') || message.author.bot) return

  const args = message.content.split(/ +/)
  const cleanArgs = message.cleanContent.split(/ +/).slice(1)
  const command = args.shift()?.toLowerCase()

  console.info(`${message.author.username}: ${message.cleanContent}`)

  // Some commands are only supported as DMs
  if (message.channel.type === "dm") {
    if (command === '!prefix') {
      const channelId = args.shift()?.replace(/[^0-9]/gi, '')
      const prefix = args.join(' ')

      if (channelId && prefix) {
        gif.setChannelPrefix(channelId, prefix)
      } else {
        console.error('Missing channelId or prefix')
      }
    }
  }

  if (command === "!gif") {
    message.channel.startTyping()
    const query = cleanArgs.join(' ')
    const url = await gif.search(query, message.channel.id)
    if (url) {
      const attachment = new MessageAttachment(url)
      attachment.name = "attachment.gif"
      message.channel.send(attachment)
    }
    message.channel.stopTyping(true)
  }

  if (command === "!nsfw") {
    message.channel.startTyping()
    const query = cleanArgs.join(' ')
    const url = await nsfw.search(query, message.channel.id)
    if (url) {
      const attachment = new MessageAttachment(url)
      attachment.name = "attachment.gif"
      message.channel.send(attachment)
    }
    message.channel.stopTyping(true)
  }
})

client.login(process.env.BOT_TOKEN)
