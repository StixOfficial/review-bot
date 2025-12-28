require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionType
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const REVIEW_CHANNEL = "1447572361405661345";

process.on("unhandledRejection", (error) => {
    if (error?.code === 10062) return;
    console.error(error);
});

client.once("clientReady", async () => {
    console.log("Review bot online!");

    client.user.setPresence({
        activities: [{ name: "Fuze Studios", type: 3 }],
        status: "online"
    });

    const command = new SlashCommandBuilder()
        .setName("review")
        .setDescription("Leave a review");

    await client.application.commands.set([command]);
});

client.on("interactionCreate", async (interaction) => {
    try {

        // Slash command
        if (interaction.isChatInputCommand() && interaction.commandName === "review") {
            await interaction.deferReply({ flags: 64 });

            const stars = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("stars")
                    .setPlaceholder("Select your star rating")
                    .addOptions(
                        { label: "⭐ 1", value: "1" },
                        { label: "⭐⭐ 2", value: "2" },
                        { label: "⭐⭐⭐ 3", value: "3" },
                        { label: "⭐⭐⭐⭐ 4", value: "4" },
                        { label: "⭐⭐⭐⭐⭐ 5", value: "5" }
                    )
            );

            return interaction.editReply({
                content: "Select your star rating:",
                components: [stars]
            });
        }

        // Star selected
        if (interaction.isStringSelectMenu() && interaction.customId === "stars") {
            const rating = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`review_${rating}`)
                .setTitle("Leave a Review");

            const input = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Your review")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));

            return interaction.showModal(modal);
        }

        // Review submitted
        if (interaction.type === InteractionType.ModalSubmit) {
            const rating = interaction.customId.split("_")[1];
            const text = interaction.fields.getTextInputValue("text");

            const channel = await client.channels.fetch(REVIEW_CHANNEL);

            const messages = await channel.messages.fetch({ limit: 100 });
            const reviewCount = messages.filter(m => m.embeds.length).size + 1;

            const embed = new EmbedBuilder()
                .setColor(0x00FF9C)
                .setTitle(`Review from @${interaction.user.username} | Total reviews: ${reviewCount}`)
                .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: "Rating", value: "⭐".repeat(Number(rating)), inline: false },
                    { name: "Comment", value: text, inline: false }
                )
                .setFooter({ text: interaction.user.username })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            return interaction.reply({
                content: "Thank you for leaving a review! ❤️",
                flags: 64
            });
        }

    } catch (e) {
        if (e?.code !== 10062) console.error(e);
    }
});

client.login(process.env.TOKEN);
