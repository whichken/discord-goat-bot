// Set up the environment
import dotenv from "dotenv"
dotenv.config()

import Discord from "discord.js"

const client = new Discord.Client()

client.once('ready', () => {
  console.log('Ready')
})

client.on('message', message => {
  if (message.content === '!ping') message.channel.send('Pong.')
})

client.login(process.env.BOT_TOKEN)
