const {MessageEmbed} = require('discord.js')
const {specialArg, readFile, randint, changeDB, format} = require('../utils/functions.js')
const {testOnly} = require("../config.json")

module.exports =  {
    aliases: ['roleta'],
    category: 'Economia',
    description: 'Bet on the roulette',
    slash: 'both',
    cooldown: '1s',
    guildOnly: true,
    testOnly,
    minArgs: 2,
    expectedArgs: '<type> <falcoins>',
    expectedArgsTypes: ['STRING', 'STRING'],
    options: [{
        name:'type',
        description: 'all bets have a 1-1 payout ratio, except green that has a 35-1 because you bet on a single number',
        required: true,
        type: "STRING",
        choices: [{name: "black", value: "black"}, {name: "red", value: "red"}, {name: "green", value: "green"}, {name: "high", value: "high"}, {name: "low", value: "low"}, {name: "even", value: "even"}, {name: "odd", value: "odd"}]
    },
    {
        name: 'falcoins',
        description: 'amount of falcoins to bet (supports "all"/"half" and things like 50.000, 20%, 10M, 25B)',
        required: true,
        type: "STRING"
    }
    ],
    callback: async ({instance, guild, user, args}) => {
        try {
            args[0] = args[0].toLowerCase()
            if (args[0] === 'ímpar') {args[0] = 'impar'}
    
            if (args[0] == 'preto' || args[0] == 'black' || args[0] == 'vermelho' || args[0] == 'red' || args[0] == 'verde' || args[0] == 'green' || args[0] == 'altos' || args[0] == 'high' || args[0] == 'baixos' || args[0] == 'low' || args[0] == 'par' || args[0] == 'even' || args[0] == 'impar' || args[0] == 'odd') {
                try {
                    var bet = await specialArg(args[1], user.id, "falcoins")
                } catch {
                    return instance.messageHandler.get(guild, "VALOR_INVALIDO", {VALUE: args[1]})
                }

                if (await readFile(user.id, 'falcoins') >= bet && bet > 0) {
                    await changeDB(user.id, 'falcoins', -bet)
                    const types = {
                        verde: [0],
                        green: [0],
                        vermelho: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
                        red : [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
                        preto: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
                        black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
                        baixos: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                        low: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                        altos: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
                        high: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
                        impar: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
                        odd: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
                        par: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
                        even: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
                    }
                    
                    var type = types[args[0]]
                    if (type === "verde" || type === "green") {
                        var profit = bet * 37
                    } else {
                        var profit = bet * 2
                    }
    
                    const luck = randint(0, 36)
    
                    if (type.includes(luck)) {
                        await changeDB(user.id, 'falcoins', profit)
                        var embed = new MessageEmbed()
                         .setColor(3066993)
                         .setAuthor({name: user.username, iconURL: user.avatarURL()})
                         .addFields({
                             name: instance.messageHandler.get(guild, "VOCE_GANHOU") + ' :sunglasses:',
                             value: instance.messageHandler.get(guild, "BOT_ROLOU") + ` **${luck}**`,
                             inline: true
                         }, {
                             name: instance.messageHandler.get(guild, "GANHOS"),
                             value:`${await format(profit)} falcoins`,
                             inline: true
                         })
                         .addField(instance.messageHandler.get(guild, "SALDO_ATUAL"), `${await readFile(user.id, 'falcoins', true)} falcoins`, false)
                    } else {
                        var embed = new MessageEmbed()
                         .setColor(15158332)
                         .setAuthor({name: user.username, iconURL: user.avatarURL()})
                         .addFields({
                             name: instance.messageHandler.get(guild, "VOCE_PERDEU") + ' :pensive:',
                             value: instance.messageHandler.get(guild, "BOT_ROLOU") + ` **${luck}**`,
                             inline: true
                         }, {
                             name:instance.messageHandler.get(guild, "PERDAS"),
                             value:`${await format(bet)} falcoins`,
                             inline: true
                        })
                        embed.addField(instance.messageHandler.get(guild, "SALDO_ATUAL"), `${await readFile(user.id, 'falcoins', true)} falcoins`, false)
                    }
                    embed.setFooter({text: 'by Falcão ❤️'})
                    return embed
                } else {
                    return instance.messageHandler.get(guild, "FALCOINS_INSUFICIENTES")
                }
            } else {
                return instance.messageHandler.get(guild, "VALOR_INVALIDO", {VALUE: args[0]})
            }
        } catch (error) {
            console.error(`roulette: ${error}`)
        }
    }
}   