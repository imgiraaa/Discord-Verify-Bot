const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', '..', 'config.json');

async function logAction(guild, logEmbed) {
    if (!guild) return;

    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const guildConfig = config[guild.id];

        if (!guildConfig || !guildConfig.logChannelId) {
            return;
        }

        const logChannel = await guild.channels.fetch(guildConfig.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send({ embeds: [logEmbed] });
        }
    } catch (error) {
        console.error(`Gagal mengirim log ke server ${guild.name}:`, error.message);
    }
}

module.exports = { logAction };

