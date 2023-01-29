const { MessageEmbed } = require("discord.js")
const Roll = require("roll")
const { getRoleColor } = require("../utils/functions.js")
const { testOnly } = require("../config.json")
const { Falbot } = require("../../index.js")

module.exports = {
	description: "Roll dice for you",
	slash: true,
	guildOnly: true,
	testOnly,
	options: [
		{
			name: "dice",
			description: "dice to be rolled",
			required: true,
			type: "STRING",
		},
	],
	callback: async ({ guild, interaction, user, text }) => {
		try {
			await interaction.deferReply()
			const roll = new Roll()
			text = text.replace(/\s/g, "")

			if (!roll.validate(text)) {
				await interaction.editReply({
					content: Falbot.getMessage(guild, "VALOR_INVALIDO", {
						VALUE: text,
					}),
				})
			} else {
				rolled = roll.roll(text).result.toString()

				embed = new MessageEmbed()
					.setColor(await getRoleColor(guild, user.id))
					.addFields(
						{
							name: "🎲:",
							value: text,
							inline: false,
						},
						{
							name: Falbot.getMessage(guild, "RESULTADO"),
							value: `**${rolled}**`,
							inline: false,
						}
					)
					.setFooter({ text: "by Falcão ❤️" })
				await interaction.editReply({
					embeds: [embed],
				})
			}
		} catch (error) {
			console.error(`roll: ${error}`)
		}
	},
}
