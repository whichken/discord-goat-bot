import fs from "fs"
import { Collection, Message, Channel, TextChannel } from "discord.js"

function collectionFilter(message: Message) {
  // Ignore bots, commands to bots, and links (since they are just dumb gifs 99% of the time)
  return !(message.author.bot || message.cleanContent.startsWith("!") || message.cleanContent.startsWith("http"))
}

function dump(collected: Collection<string, Message>, reason: string) {
  if (!collected.size) return

  const contents = "<|startoftext|>\n" + collected.reduce((cur, message) => `${cur}${message.author.username}: ${message.cleanContent}\n`, "") + "<|endoftext|>\n\n"
  fs.appendFileSync("training.txt", contents)
}

export function registerCollector(channel: Channel) {
  const collector = (channel as TextChannel).createMessageCollector(collectionFilter, { idle: 600000 })
  collector.on("end", (collected, reason) => {
    dump(collected, reason)
    registerCollector(channel)
  })
}