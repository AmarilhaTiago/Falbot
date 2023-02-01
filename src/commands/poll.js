const { MessageEmbed } = require("discord.js")
const { getRoleColor } = require("../utils/functions.js")
const { testOnly } = require("../config.json")
const { Falbot } = require("../../index.js")

module.exports = {
	description: "Create a little pretty poll",
	slash: true,
	guildOnly: true,
	testOnly,
	options: [
		{
			name: "theme",
			description: "theme of the poll",
			required: true,
			type: "STRING",
		},
	],
	callback: async ({ guild, interaction, user, member, text }) => {
		try {
			await interaction.deferReply()
			const embed = new MessageEmbed()
				.setColor(await getRoleColor(guild, user.id))
				.setDescription(text)
				.setAuthor({
					name: Falbot.getMessage(guild, "ENQUETE", {
						USER: member.displayName,
					}),
					iconURL: user.avatarURL(),
				})
				.setFooter({ text: "by Falcão ❤️" })

			answer = await interaction.editReply({
				embeds: [embed],
				fetchReply: true,
			})

			answer.react("👍")
			answer.react("👎")
		} catch (error) {
			console.error(`poll: ${error}`)
			interaction.editReply({
				content: Falbot.getMessage(guild, "EXCEPTION"),
				embeds: [],
			})
		}
	},
}
