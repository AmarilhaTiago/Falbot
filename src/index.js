const { randint, changeDB, format } = require("./utils/functions.js")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const path = require("path")
const { language } = require("./config.json")
require("dotenv").config()

class Falbot {
	defaultLanguage = language
	_messages = require(path.join(__dirname, "/utils/json/messages.json"))
	_languages = new Map()
	levels = require("./utils/json/levels.json")
	userSchema = require("./schemas/user-schema")
	lottoSchema = require("./schemas/lotto-schema")
	coolSchema = require("./schemas/cool-schema.js")
	langSchema = require("./schemas/lang-schema.js")
	interestSchema = require("./schemas/interest-schema.js")

	constructor(wok, client) {
		this.wok = wok
		this.client = client
		;(async () => {
			const results = await this.langSchema.find()

			for (const { _id, language } of results) {
				this._languages.set(_id, language)
			}
		})()

		setInterval(async () => {
			await this.coolSchema.updateMany({}, { $inc: { cooldown: -5 } })
			await this.coolSchema.deleteMany({ cooldown: { $lt: 5 } })
		}, 5000)

		setInterval(() => {
			this.client.user.setActivity("/help | arte by: @kinsallum"),
				this.bankInterest(),
				this.sendVoteReminders(),
				this.lotteryDraw()
		}, 1000 * 60 * 10)
	}

	async bankInterest() {
		let interest = await this.interestSchema.findById("interest")
		if (Date.now() - interest.lastInterest > interest.interestTime) {
			console.log("poupança!")
			interest.lastInterest = Date.now().toString()

			var users = await this.userSchema.find({
				banco: { $gt: 0 },
			})

			let user
			for (user of users) {
				var limit = this.levels[user.rank - 1].bankLimit

				if (limit > user.banco) {
					user.banco += Math.floor(
						parseInt(user.banco * parseFloat(interest.interestRate))
					)
				}

				if (user.banco > limit) {
					user.banco = limit
				}

				user.save()
			}
			interest.save()
		}
	}

	async sendVoteReminders() {
		try {
			var users = await this.userSchema.find({
				voteReminder: true,
			})

			let user
			for (user of users) {
				//send dm reminder vote if user wants to
				if (
					Date.now() - user.lastVote > 1000 * 60 * 60 * 12 &&
					Date.now() - user.lastReminder > 1000 * 60 * 60 * 12
				) {
					var discordUser = await this.client.users.fetch(user._id)
					const embed = new MessageEmbed()
						.setColor("YELLOW")
						.addFields(
							{
								name: await this.getMessage(discordUser, "VOTE_REMINDER"),
								value: await this.getMessage(discordUser, "REWARD_AFTER"),
							},
							{
								name: "Link",
								value: "https://top.gg/bot/742331813539872798/vote",
							}
						)
						.setFooter({ text: "by Falcão ❤️" })

					const row = new MessageActionRow().addComponents(
						new MessageButton()
							.setCustomId("disableVoteReminder")
							.setLabel(await this.getMessage(discordUser, "DISABLE_REMINDER"))
							.setEmoji("🔕")
							.setStyle("DANGER")
					)

					await discordUser.send({
						embeds: [embed],
						components: [row],
					})

					user.lastReminder = Date.now()
					user.save()
				}
			}
		} catch (err) {
			console.log(`Sending reminders: ${err}`)
		}
	}

	async lotteryDraw() {
		let lotto = await this.lottoSchema.findById("semanal")

		if (Date.now() > lotto.nextDraw) {
			console.log("loteria!")

			var users = await this.userSchema.find({
				tickets: { $gt: 0 },
			})

			if (users.length > 0) {
				var numTickets = 0
				let user
				for (user of users) {
					numTickets += user.tickets
				}

				var winner
				while (winner === undefined) {
					for (user of users) {
						if (randint(1, numTickets) <= user.tickets) {
							winner = user
						}
					}
				}

				await changeDB(winner.id, "falcoins", lotto.prize)

				var winnerUser = await this.client.users.fetch(winner.id)

				const embed = new MessageEmbed()
					.setColor("GOLD")
					.addFields({
						name: await this.getMessage(winnerUser, "CONGRATULATIONS"),
						value: await this.getMessage(winnerUser, "LOTTERY_WIN", {
							PRIZE: format(lotto.prize),
							TICKETS: format(winner.tickets),
							TOTAL: format(numTickets),
						}),
					})
					.setFooter({ text: "by Falcão ❤️" })

				await this.userSchema.updateMany(
					{
						tickets: { $gt: 0 },
					},
					{
						tickets: 0,
					}
				)

				await winnerUser.send({
					embeds: [embed],
				})

				if (lotto.history.length >= 10) {
					lotto.history.pop()
				}

				lotto.history.unshift({
					prize: lotto.prize,
					winner: winnerUser.username,
					userTickets: winner.tickets,
					totalTickets: numTickets,
				})
			}
			lotto.nextDraw = Date.now() + 604800000 //next one is next week
			lotto.prize = randint(1000000, 2000000)

			await lotto.save()
		}
	}

	setLanguage(guildUser, language) {
		if (guildUser) {
			this._languages.set(guildUser.id, language)
		}
	}

	getLanguage(guildUser) {
		if (guildUser) {
			const result = this._languages.get(guildUser.id)
			if (result) {
				return result
			}
		}
		return this.defaultLanguage
	}

	getMessage(guildUser, messageId, args = {}) {
		const language = this.getLanguage(guildUser)
		const translations = this._messages[messageId]
		if (!translations) {
			console.error(
				`Could not find the correct message to send for "${messageId}"`
			)
			return "Could not find the correct message to send. Please report this to the bot developer."
		}

		let result = translations[language]

		for (const key of Object.keys(args)) {
			const expression = new RegExp(`{${key}}`, "g")
			result = result.replace(expression, args[key])
		}

		return result
	}

	async rankPerks(old_rank, rank, guild) {
		var perks = ""
		if (old_rank != undefined) {
			if (old_rank.bankLimit < rank.bankLimit) {
				perks += this.getMessage(guild, "RANKUP_BANK", {
					FALCOINS: format(rank.bankLimit - old_rank.bankLimit),
				})
				perks += "\n"
			}
		}

		perks += `${this.getMessage(guild, "VOTO")}: ${format(
			rank.vote
		)} Falcoins\n`

		perks += `${this.getMessage(guild, "TRABALHO")}: ${format(
			rank.work[0]
		)}-${format(rank.work[1])} Falcoins`

		return perks
	}
}

module.exports = { Falbot }
