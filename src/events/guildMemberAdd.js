const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', '..', 'config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const guildConfig = config[member.guild.id];

        if (!guildConfig || !guildConfig.unverifiedRoleId) {
            console.log(`[${member.guild.name}] Role non-verify tidak diatur. Anggota baru ${member.user.tag} tidak diberi role.`);
            return;
        }

        try {
            const role = await member.guild.roles.fetch(guildConfig.unverifiedRoleId);
            if (role) {
                await member.roles.add(role);
                console.log(`Memberikan role '${role.name}' kepada ${member.user.tag}.`);
            } else {
                console.log(`[${member.guild.name}] Role non-verify dengan ID ${guildConfig.unverifiedRoleId} tidak ditemukan.`);
            }
        } catch (error) {
            console.error(`Gagal memberikan role non-verify di server ${member.guild.name}:`, error);
        }
    },
};
