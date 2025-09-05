const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createPanelEmbed } = require('../utils/embeds');
const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verifikasi')
        .setDescription('Perintah terkait sistem verifikasi.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Mengatur sistem verifikasi melalui modal.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kirim')
                .setDescription('Mengirim panel verifikasi ke channel yang dipilih.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel tujuan untuk mengirim panel.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            await interaction.reply({ content: 'Perintah ini hanya bisa digunakan di dalam server.', ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const modal = new ModalBuilder()
                .setCustomId('verificationSetupModal')
                .setTitle('Pengaturan Sistem Verifikasi');

            // Baris Input
            const titleInput = new TextInputBuilder().setCustomId('titleInput').setLabel("Judul Embed Verifikasi").setStyle(TextInputStyle.Short).setRequired(true);
            const descInput = new TextInputBuilder().setCustomId('descInput').setLabel("Deskripsi Embed Verifikasi").setStyle(TextInputStyle.Paragraph).setRequired(true);
            const verifiedRoleInput = new TextInputBuilder().setCustomId('verifiedRoleInput').setLabel("ID Role Setelah Verifikasi").setStyle(TextInputStyle.Short).setRequired(true);
            const unverifiedRoleInput = new TextInputBuilder().setCustomId('unverifiedRoleInput').setLabel("ID Role Sebelum Verifikasi (Non-Verify)").setStyle(TextInputStyle.Short).setRequired(true);
            const rulesInput = new TextInputBuilder().setCustomId('rulesInput').setLabel("Peraturan (Tampil setelah klik verif)").setStyle(TextInputStyle.Paragraph).setRequired(true);

            // Action Rows
            const firstRow = new ActionRowBuilder().addComponents(titleInput);
            const secondRow = new ActionRowBuilder().addComponents(descInput);
            const thirdRow = new ActionRowBuilder().addComponents(verifiedRoleInput);
            const fourthRow = new ActionRowBuilder().addComponents(unverifiedRoleInput);
            const fifthRow = new ActionRowBuilder().addComponents(rulesInput);

            modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);
            await interaction.showModal(modal);

        } else if (subcommand === 'kirim') {
            const channel = interaction.options.getChannel('channel');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const guildConfig = config[interaction.guild.id];

            if (!guildConfig) {
                await interaction.reply({ content: 'Anda harus menjalankan `/verifikasi setup` terlebih dahulu!', ephemeral: true });
                return;
            }

            const panelEmbed = createPanelEmbed(guildConfig.title, guildConfig.description);
            const verifyButton = new ButtonBuilder()
                .setCustomId('startVerification')
                .setLabel('Verifikasi Diri Anda')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅');

            const row = new ActionRowBuilder().addComponents(verifyButton);

            await channel.send({ embeds: [panelEmbed], components: [row] });
            await interaction.reply({ content: `Panel verifikasi berhasil dikirim ke ${channel}.`, ephemeral: true });
        }
    },
};
