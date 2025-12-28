require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const REVIEW_CHANNEL = "PUT_CHANNEL_ID_HERE";

client.once("ready", async () => {
    console.log("Review bot online!");

    const command = new SlashCommandBuilder()
        .setName("review")
        .setDescription("Leave a review");

    await client.application.commands.create(command);
});

client.on("interactionCreate", async interaction => {

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "review") {

            const stars = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("stars")
                    .setPlaceholder("Select your star rating")
                    .addOptions([
                        { label: "⭐ 1", value: "1" },
                        { label: "⭐⭐ 2", value: "2" },
                        { label: "⭐⭐⭐ 3", value: "3" },
                        { label: "⭐⭐⭐⭐ 4", value: "4" },
                        { label: "⭐⭐⭐⭐⭐ 5", value: "5" }
                    ])
            );

           await interaction.deferReply({ ephemeral: true });
           await interaction.editReply({ content: "Select your rating:", components: [stars] });

        }
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "stars") {
            const rating = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`review-${rating}`)
                .setTitle("Leave a Review");

            const reviewInput = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Your review")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(reviewInput));

            await interaction.showModal(modal);
        }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
        const rating = interaction.customId.split("-")[1];
        const review = interaction.fields.getTextInputValue("text");

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(review)
            .addFields({ name: "Rating", value: "⭐".repeat(rating) })
            .setFooter({ text: "Thank you for your review!" })
            .setTimestamp();

        const channel = await client.channels.fetch(REVIEW_CHANNEL);
        channel.send({ embeds: [embed] });

        if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Thank you for leaving a review! ❤️", ephemeral: true });
        } else {
        await interaction.reply({ content: "Thank you for leaving a review! ❤️", ephemeral: true });
}

    }
});

client.login(process.env.TOKEN);

