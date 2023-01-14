require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const axios = require('axios').default

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

bot.on('messageCreate', msg => {
    if(msg.author.bot) return

    if(msg.channelId == process.env.ALLOWED_CHANNEL && msg.content) {
        console.log(`${msg.author.username} called text generation`)

        axios.post(`https://api-inference.huggingface.co/models/${process.env.HF_MODEL}`, JSON.stringify(msg.content), {
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}`
            }
        }).then(res => {
            msg.reply(res.data[0].generated_text)
        }).catch(err => {
            if(err.data && err.data.estimated_time) {
                msg.reply(`Модель загружается, подождите ещё примерно ${Math.round(err.data.estimated_time)} секунд...`)
                return
            }

            console.log(err)
            msg.reply('Ошибка апи hugging face напиши мисту')
        })
    }
})

bot.on('ready', () => {
    console.log('bot ready')
})

bot.login(process.env.BOT_TOKEN)