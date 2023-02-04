const { EmbedBuilder } = require("discord.js")
const { readFile, changeDB, format } = require("../utils/functions.js")
const { testOnly } = require("../config.json")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	testOnly,
	data: new SlashCommandBuilder()
		.setName("ranks")
		.setDescription("Increase you rank")
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand.setName("rankup").setDescription("Increase you rank")
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("view").setDescription("View upcoming ranks")
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("all").setDescription("View all ranks")
		),
	execute: async ({ guild, user, interaction, instance }) => {
		try {
			await interaction.deferReply()
			type = interaction.options.getSubcommand()
			var levels = instance.levels

			if (type === "rankup") {
				var rank_number = await readFile(user.id, "rank")
				rank = levels[rank_number - 1]

				if (rank.falcoinsToLevelUp === undefined) {
					await interaction.editReply({
						content: instance.getMessage(guild, "MAX_RANK", {
							USER: user,
						}),
					})
				} else if (
					(await readFile(user.id, "falcoins")) < rank.falcoinsToLevelUp
				) {
					await interaction.editReply({
						content: instance.getMessage(guild, "NO_MONEY_RANK", {
							FALCOINS: format(
								rank.falcoinsToLevelUp - (await readFile(user.id, "falcoins"))
							),
						}),
					})
				} else {
					new_rank = levels[rank_number]

					await changeDB(user.id, "falcoins", -rank.falcoinsToLevelUp)
					await changeDB(user.id, "rank", rank_number + 1, true)

					perks = await instance.rankPerks(rank, new_rank, guild)

					var embed = new EmbedBuilder()
						.setColor("AQUA")
						.addFields(
							{
								name: "Rank Up!",
								value: instance.getMessage(guild, "RANKUP_SUCESS", {
									RANK: instance.getMessage(guild, String(rank_number + 1)),
									FALCOINS: format(rank.falcoinsToLevelUp),
								}),
							},
							{
								name: instance.getMessage(guild, "RANKUP_PERKS"),
								value: perks,
							}
						)
						.setFooter({ text: "by Falcão ❤️" })

					await interaction.editReply({
						embeds: [embed],
					})
				}
			} else if (type === "view") {
				var rank_number = await readFile(user.id, "rank")
				if (rank_number === 16) {
					await interaction.editReply({
						content: instance.getMessage(guild, "MAX_RANK", {
							USER: user,
						}),
					})
					return
				}

				quantity = 16 - rank_number
				if (quantity > 3) {
					quantity = 3
				}

				var embed = new EmbedBuilder()
					.setColor("DARK_PURPLE")
					.setTitle(instance.getMessage(guild, "UPCOMING_RANKS"))
					.addFields({
						name:
							instance.getMessage(guild, String(rank_number)) +
							" - " +
							format(levels[rank_number - 1].falcoinsToLevelUp) +
							" Falcoins" +
							instance.getMessage(guild, "CURRENT_RANK"),
						value: await instance.rankPerks(
							levels[rank_number - 2],
							levels[rank_number - 1],
							guild
						),
					})

				for (var i = 0; i < quantity; i++) {
					if (levels[rank_number + i].falcoinsToLevelUp === undefined) {
						embed.addFields({
							name:
								instance.getMessage(guild, String(rank_number + i + 1)) +
								" - " +
								instance.getMessage(guild, "MAX_RANK2"),
							value: await instance.rankPerks(
								levels[rank_number - 1 + i],
								levels[rank_number + i],
								guild
							),
						})
					} else {
						embed.addFields({
							name:
								instance.getMessage(guild, String(rank_number + i + 1)) +
								" - " +
								format(levels[rank_number + i].falcoinsToLevelUp) +
								" Falcoins",
							value: await instance.rankPerks(
								levels[rank_number - 1 + i],
								levels[rank_number + i],
								guild
							),
						})
					}
				}

				embed.setFooter({ text: "by Falcão ❤️" })
				await interaction.editReply({ embeds: [embed] })
			} else {
				var embed = new EmbedBuilder().setColor("DARK_PURPLE")

				ranks = ""
				for (var i = 0; i < levels.length; i++) {
					if (levels[i].falcoinsToLevelUp === undefined) {
						ranks +=
							`**${instance.getMessage(guild, String(i + 1))}** - ` +
							instance.getMessage(guild, "MAX_RANK2") +
							"\n"
					} else {
						ranks += `**${instance.getMessage(
							guild,
							String(i + 1)
						)}** - ${format(levels[i].falcoinsToLevelUp)} falcoins\n`
					}
				}
				embed
					.addFields({
						name: instance.getMessage(guild, "ALL_RANKS"),
						value: ranks,
					})
					.setFooter({ text: "by Falcão ❤️" })
				await interaction.editReply({ embeds: [embed] })
			}
		} catch (err) {
			console.error(`ranks: ${err}`)
			interaction.editReply({
				content: instance.getMessage(guild, "EXCEPTION"),
				embeds: [],
			})
		}
	},
}
