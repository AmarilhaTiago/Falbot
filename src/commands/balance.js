const { MessageEmbed } = require("discord.js")
const {
	getMember,
	getRoleColor,
	format,
	readFile,
} = require("../utils/functions.js")
const { testOnly } = require("../config.json")
const levels = require("../utils/json/levels.json")

module.exports = {
	aliases: ["eu", "credits", "sobre"],
	category: "Economia",
	description: "Shows your or another user's balance",
	slash: "both",
	cooldown: "1s",
	guildOnly: true,
	testOnly,
	expectedArgs: "[user]",
	expectedArgsTypes: ["USER"],
	options: [
		{
			name: "user",
			description:
				"the user you want to get info about, leave blank to get your balance",
			required: false,
			type: "USER",
		},
	],
	callback: async ({ instance, guild, message, member, args }) => {
		try {
			if (message && args[0]) {
				if (args[0][2] == "!") {
					args[0] = args[0].slice(3, -1)
				} else {
					args[0] = args[0].slice(2, -1)
				}
			}

			const realMember = args[0] ? await getMember(guild, args[0]) : member
			const userFile = await readFile(realMember.user.id)

			const embed = new MessageEmbed()
				.setTitle(
					instance.messageHandler.get(guild, userFile.rank) +
						" " +
						realMember.displayName
				)
				.setColor(await getRoleColor(guild, realMember.user.id))
				.setFooter({ text: "by Falcão ❤️" })
				.addFields(
					{
						name: ":coin: Falcoins",
						value: `${await format(userFile.falcoins)}`,
						inline: true,
					},
					{
						name: ":trophy: " + instance.messageHandler.get(guild, "VITORIAS"),
						value: `${await format(userFile.vitorias)}`,
						inline: true,
					},
					{
						name: ":bank: " + instance.messageHandler.get(guild, "BANCO"),
						value: `${await format(userFile.banco)}`,
						inline: true,
					},
					{
						name: ":gift: " + instance.messageHandler.get(guild, "CAIXAS"),
						value: `${await format(userFile.caixas)}`,
						inline: true,
					},
					{
						name: ":key: " + instance.messageHandler.get(guild, "CHAVES"),
						value: `${await format(userFile.chaves)}`,
						inline: true,
					}
				)
			if (levels[userFile.rank - 1].falcoinsToLevelUp === undefined) {
				embed.setDescription(
					":sparkles: " + instance.messageHandler.get(guild, "MAX_RANK2")
				)
			} else if (
				levels[userFile.rank - 1].falcoinsToLevelUp <= userFile.falcoins
			) {
				embed.setDescription(
					instance.messageHandler.get(guild, "BALANCE_RANKUP")
				)
			} else {
				embed.setDescription(
					instance.messageHandler.get(guild, "BALANCE_RANKUP2", {
						FALCOINS: await format(
							levels[userFile.rank - 1].falcoinsToLevelUp - userFile.falcoins
						),
					})
				)
			}
			return embed
		} catch (error) {
			console.error(`balance: ${error}`)
		}
	},
}
