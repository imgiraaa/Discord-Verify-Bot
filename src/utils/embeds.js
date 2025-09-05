const { EmbedBuilder } = require('discord.js');

function createPanelEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: 'Sistem Verifikasi' });
}

function createRulesEmbed(rules) {
    return new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('📜 Peraturan Server')
        .setDescription(rules)
        .setFooter({ text: 'Harap baca dan setujui peraturan ini.' });
}

function createSuccessEmbed(message) {
    return new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('✅ Verifikasi Berhasil')
        .setDescription(message)
        .setTimestamp();
}

function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Terjadi Kesalahan')
        .setDescription(message)
        .setTimestamp();
}

function createLogEmbed(title, description, user) {
    const embed = new EmbedBuilder()
        .setColor('#7f8c8d')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();

    if (user) {
        embed.setFooter({
            text: `Aksi oleh: ${user.tag} (ID: ${user.id})`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        });
    }
    return embed;
}

module.exports = {
    createPanelEmbed,
    createRulesEmbed,
    createSuccessEmbed,
    createErrorEmbed,
    createLogEmbed,
};


