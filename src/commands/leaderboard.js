const { EmbedBuilder, ButtonBuilder } = require("discord.js")
const { getMember, format, paginate } = require("../utils/functions.js")
const { testOnly } = require("../config.json")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	testOnly,
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("show the global or local ranking of users")
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("falcoins")
				.setDescription("View users ranked by falcoins")
				.addStringOption((option) =>
					option
						.setName("type")
						.setDescription("server or global")
						.setRequired(true)
						.addChoices(
							{ name: "server", value: "server" },
							{ name: "global", value: "global" }
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("rank")
				.setDescription("View users ranked by ranks")
				.addStringOption((option) =>
					option
						.setName("type")
						.setDescription("server or global")
						.setRequired(true)
						.addChoices(
							{ name: "server", value: "server" },
							{ name: "global", value: "global" }
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("wins")
				.setDescription("View users ranked by wins")
				.addStringOption((option) =>
					option
						.setName("type")
						.setDescription("server or global")
						.setRequired(true)
						.addChoices(
							{ name: "server", value: "server" },
							{ name: "global", value: "global" }
						)
				)
		),
	execute: async ({ client, user, guild, interaction, instance }) => {
		await interaction.deferReply()
		rank = []
		scope = interaction.options.getString("type").toLowerCase()
		type = interaction.options.getSubcommand()

		var embed1 = new EmbedBuilder()
			.setColor("DarkBlue")
			.setFooter({ text: "by Falcão ❤️" })
		var embed2 = new EmbedBuilder()
			.setColor("DarkBlue")
			.setFooter({ text: "by Falcão ❤️" })
		var embed3 = new EmbedBuilder()
			.setColor("DarkBlue")
			.setFooter({ text: "by Falcão ❤️" })

		embeds = [embed1, embed2, embed3]

		if (type == "falcoins") {
			if (scope === "server") {
				users = await instance.userSchema
					.find({})
					.sort({ falcoins: -1 })
					.limit(30)

				for (useri of users) {
					if (await getMember(guild, useri["_id"])) {
						rank.push(useri)
					}
				}
			} else {
				rank = await instance.userSchema
					.find({})
					.sort({ falcoins: -1 })
					.limit(30)
			}
		} else if (type == "rank") {
			if (scope === "server") {
				users = await instance.userSchema.find({}).sort({ rank: -1 }).limit(30)

				for (useri of users) {
					if (await getMember(guild, useri["_id"])) {
						rank.push(useri)
					}
				}
			} else {
				rank = await instance.userSchema.find({}).sort({ rank: -1 }).limit(30)
			}
		} else if (type == "wins") {
			if (scope === "server") {
				users = await instance.userSchema
					.find({})
					.sort({ vitorias: -1 })
					.limit(30)

				for (useri of users) {
					if (await getMember(guild, useri["_id"])) {
						rank.push(useri)
					}
				}
			} else {
				rank = await instance.userSchema
					.find({})
					.sort({ vitorias: -1 })
					.limit(30)
			}
		}

		for (let i = 0; i < rank.length; i++) {
			if (i <= 9) {
				a = 0
			} else if (i <= 19) {
				a = 1
			} else {
				a = 2
			}
			try {
				if (scope === "server") {
					member = await getMember(guild, rank[i]["_id"])
					username = member.displayName
				} else {
					user = await client.users.fetch(rank[i]["_id"])
					username = user.username
				}

				embeds[a].addFields({
					name:
						type == "wins"
							? `${i + 1}º - ${username} ` +
							  instance.getMessage(guild, "VITORIAS").toLowerCase() +
							  ":"
							: `${i + 1}º - ${username} ${type}:`,
					value:
						type == "rank"
							? `${instance.getMessage(guild, rank[i][type])}`
							: `${
									type == "wins" ? rank[i]["vitorias"] : format(rank[i][type])
							  }`,
				})
			} catch {
				embeds[a].addFields({
					name:
						type === "vitorias"
							? `${i + 1}º - Unknown user ` +
							  instance.getMessage(guild, "VITORIAS").toLowerCase() +
							  ":"
							: `${i + 1}º - Unknown user ${type}:`,
					value:
						type === "rank"
							? `${instance.getMessage(guild, rank[i][type])}`
							: `${
									type == "wins" ? rank[i]["vitorias"] : format(rank[i][type])
							  }`,
				})
			}
		}

		if (embed3.data.fields) {
			embeds = [embed1, embed2, embed3]
		} else if (embed2.data.fields) {
			embeds = [embed1, embed2]
		} else {
			embeds = [embed1]
		}

		if (embeds.length > 1) {
			for (let i = 0; i < embeds.length; i++) {
				if (scope == "server") {
					embeds[i].setTitle(
						`${instance.getMessage(guild, "LEADERBOARD_SERVER_TITLE")} - ${
							i + 1
						}/3`
					)
				} else {
					embeds[i].setTitle(
						`${instance.getMessage(guild, "LEADERBOARD_GLOBAL_TITLE")} - ${
							i + 1
						}/3`
					)
				}
			}

			const paginator = paginate()
			paginator.add(...embeds)
			const ids = [`${Date.now()}__left`, `${Date.now()}__right`]
			paginator.setTraverser([
				new ButtonBuilder()
					.setEmoji("⬅️")
					.setCustomId(ids[0])
					.setStyle("Secondary"),
				new ButtonBuilder()
					.setEmoji("➡️")
					.setCustomId(ids[1])
					.setStyle("Secondary"),
				,
			])
			const message = await interaction.editReply(paginator.components())
			message.channel
				.createMessageComponentCollector()
				.on("collect", async (i) => {
					if (i.customId === ids[0]) {
						await paginator.back()
						await i.update(paginator.components())
					} else if (i.customId === ids[1]) {
						await paginator.next()
						await i.update(paginator.components())
					}
				})
		} else {
			if (scope == "server") {
				embed1.setTitle(instance.getMessage(guild, "LEADERBOARD_SERVER_TITLE"))
			} else {
				embed1.setTitle(instance.getMessage(guild, "LEADERBOARD_GLOBAL_TITLE"))
			}

			await interaction.editReply({ embeds: [embeds[0]] })
		}
	},
}
