const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlog')
        .setDescription('Mengatur channel untuk menerima log dari bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel teks yang akan dijadikan tujuan log.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (!config[interaction.guild.id]) {
            config[interaction.guild.id] = {};
        }

        // Simpan ID channel log
        config[interaction.guild.id].logChannelId = channel.id;

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        await interaction.reply({
            content: `Channel log berhasil diatur ke ${channel}. Semua aktivitas bot akan dicatat di sana.`,
            ephemeral: true
        });
    },
};

