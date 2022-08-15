const { MessageEmbed } = require("discord.js")
const builder = require("../utils/snake-builder.js")
const { testOnly } = require("../config.json")

module.exports = {
	category: "Fun",
	description: "Play a game of snake",
	slash: "both",
	cooldown: "1s",
	guildOnly: true,
	testOnly,
	callback: async ({ instance, guild, message, interaction, user }) => {
		try {
			const author = user
			const game = new builder.Game()

			const embed = new MessageEmbed()
				.setTitle(":snake:")
				.addField("\u200b", game.world2string(game.world, game.snake))
				.addField(
					`\u200b`,
					`:alarm_clock: ${game.time}s\n\n${instance.messageHandler.get(
						guild,
						"SCORE"
					)}: ${game.snake.length}`
				)
				.setFooter({ text: "by Falcão ❤️" })
				.setColor("PURPLE")
			if (message) {
				var answer = await message.reply({
					embeds: [embed],
				})
			} else {
				var answer = await interaction.reply({
					embeds: [embed],
					fetchReply: true,
				})
			}
			await answer.react("⬆")
			await answer.react("⬅")
			await answer.react("➡")
			await answer.react("⬇")

			const filter = (reaction, user) => {
				return user.id === author.id
			}

			const collector = answer.createReactionCollector({
				filter,
				time: 1000 * 60 * 60,
			})

			var myTimer = setInterval(async function () {
				if (game.time <= 0) {
					game.snakeMovement(game.snake, game.Sd)
					game.time = 30
				}

				embed.fields[0] = {
					name: "\u200b",
					value: game.world2string(game.world, game.snake),
				}
				embed.fields[1] = {
					name: `\u200b`,
					value: `:alarm_clock: ${game.time}s\n\n${instance.messageHandler.get(
						guild,
						"SCORE"
					)}: ${game.snake.length}`,
				}

				await answer.edit({
					embeds: [embed],
				})
				game.time -= 5
			}, 1000 * 5)

			collector.on("collect", async (reaction) => {
				if (reaction._emoji.name === "⬆") {
					game.snakeMovement(game.snake, "N")
				} else if (reaction._emoji.name === "⬅") {
					game.snakeMovement(game.snake, "W")
				} else if (reaction._emoji.name === "➡") {
					game.snakeMovement(game.snake, "E")
				} else if (reaction._emoji.name === "⬇") {
					game.snakeMovement(game.snake, "S")
				}

				embed.fields[0] = {
					name: "\u200b",
					value: game.world2string(game.world, game.snake),
				}
				embed.fields[1] = {
					name: `\u200b`,
					value: `:alarm_clock: ${game.time}s\n\n${instance.messageHandler.get(
						guild,
						"SCORE"
					)}: ${game.snake.length}`,
				}

				await answer.edit({
					embeds: [embed],
				})

				if (game.gameEnded) {
					clearInterval(myTimer)
					collector.stop()
				}
			})
		} catch (error) {
			console.error(`snake: ${error}`)
		}
	},
}
