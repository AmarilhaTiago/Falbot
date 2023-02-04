const { testOnly } = require("../config.json")
const {
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require("discord.js")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	testOnly,
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Show commands help and information")
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("page")
				.setDescription("Which help page you want to see")
				.setRequired(false)
				.addChoices(
					{ name: "💠 introduction", value: "introduction" },
					{ name: "📚 allcommands", value: "allcommands" },
					{ name: "📈 ranks", value: "ranks" },
					{ name: "💸 economy", value: "economy" },
					{ name: "🎉 fun", value: "fun" },
					{ name: "🌎 language", value: "language" },
					{ name: "📝 utils", value: "utils" }
				)
		),
	execute: async ({ guild, interaction, instance }) => {
		await interaction.deferReply()
		try {
			if (interaction.options !== undefined) {
				var page = interaction.options.getString("page")
			} else {
				var page = interaction.values[0]
			}

			const embed = new EmbedBuilder()
				.setColor("DARK_PURPLE")
				.setFooter({ text: "by Falcão ❤️" })
			if (page === "introduction") {
				embed.addFields({
					name: instance.getMessage(guild, "WELCOME"),
					value: instance.getMessage(guild, "HELP_INTRODUCTION2"),
				})
			} else if (page === "allcommands") {
				embed.setTitle(instance.getMessage(guild, "ALL_COMMANDS"))
				embed.addFields({
					name: instance.getMessage(guild, "TOO_MANY"),
					value: instance.getMessage(guild, "LINK_COMMANDS"),
				})
			} else if (page === "ranks") {
				embed.setTitle(":chart_with_upwards_trend: Ranks")
				embed.addFields({
					name: instance.getMessage(guild, "HELP_RANK"),
					value: instance.getMessage(guild, "HELP_RANK2"),
				})
			} else if (page === "economy") {
				embed.addFields({
					name: instance.getMessage(guild, "HELP_ECONOMY2"),
					value: instance.getMessage(guild, "HELP_ECONOMY3"),
				})
			} else if (page === "fun") {
				embed.addFields({
					name: instance.getMessage(guild, "HELP_FUN"),
					value: instance.getMessage(guild, "HELP_FUN2"),
				})
			} else if (page === "language") {
				embed.setTitle(instance.getMessage(guild, "HELP_LANGUAGE"))
				embed.addFields({
					name: instance.getMessage(guild, "HELP_LANGUAGE2"),
					value: instance.getMessage(guild, "HELP_LANGUAGE3"),
				})
			} else if (page === "utils") {
				embed.addFields({
					name: instance.getMessage(guild, "HELP_UTILS"),
					value: instance.getMessage(guild, "HELP_UTILS2"),
				})
			} else {
				embed.setTitle(instance.getMessage(guild, "FALBOT_WELCOME"))
				embed.addFields(
					{
						name:
							":diamond_shape_with_a_dot_inside: " +
							instance.getMessage(guild, "INTRODUCTION"),
						value: instance.getMessage(guild, "HELP_INTRODUCTION"),
						inline: true,
					},
					{
						name: ":books: " + instance.getMessage(guild, "COMMANDS_ALL"),
						value: instance.getMessage(guild, "COMMANDS_ALL2"),
						inline: true,
					},
					{
						name: ":chart_with_upwards_trend: Ranks",
						value: instance.getMessage(guild, "HELP_RANK3"),
						inline: true,
					},
					{
						name: ":money_with_wings: " + instance.getMessage(guild, "ECONOMY"),
						value: instance.getMessage(guild, "HELP_ECONOMY"),
						inline: true,
					},
					{
						name: ":tada: " + instance.getMessage(guild, "FUN"),
						value: instance.getMessage(guild, "HELP_FUN3"),
						inline: true,
					},
					{
						name: ":earth_americas: " + instance.getMessage(guild, "LANGUAGE"),
						value: instance.getMessage(guild, "HELP_LANGUAGE4"),
						inline: true,
					},
					{
						name: ":pencil: " + instance.getMessage(guild, "UTILS"),
						value: instance.getMessage(guild, "HELP_UTILS3"),
						inline: true,
					}
				)
			}
			const row = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("page")
					.setPlaceholder(instance.getMessage(guild, "PICK_PAGE"))
					.addOptions(
						{
							label: instance.getMessage(guild, "INTRODUCTION"),
							value: "introduction",
							emoji: "💠",
						},
						{
							label: instance.getMessage(guild, "COMMANDS_ALL"),
							value: "allcommands",
							emoji: "📚",
						},
						{
							label: "Ranks",
							value: "ranks",
							emoji: "📈",
						},
						{
							label: instance.getMessage(guild, "ECONOMY"),
							value: "economy",
							emoji: "💸",
						},
						{
							label: instance.getMessage(guild, "FUN"),
							value: "fun",
							emoji: "🎉",
						},
						{
							label: instance.getMessage(guild, "LANGUAGE"),
							value: "language",
							emoji: "🌎",
						},
						{
							label: instance.getMessage(guild, "UTILS"),
							value: "utils",
							emoji: "📝",
						}
					)
			)
			await interaction.editReply({ embeds: [embed], components: [row] })
		} catch (error) {
			console.error(`Help: ${error}`)
			interaction.editReply({
				content: instance.getMessage(guild, "EXCEPTION"),
				embeds: [],
				components: [],
			})
		}
	},
}
