const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createRulesEmbed, createSuccessEmbed, createErrorEmbed, createLogEmbed } = require('../utils/embeds');
const { generateCaptcha } = require('../utils/captchaGenerator');
const { logAction } = require('../utils/logger');
const configPath = path.join(__dirname, '..', '..', 'config.json');

const captchaAnswers = new Map();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- Slash Command Handler ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan command ini!', ephemeral: true });
            }
        }

        // --- Modal Submit Handler ---
        else if (interaction.isModalSubmit()) {
            // Setup Modal
            if (interaction.customId === 'verificationSetupModal') {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

                config[interaction.guild.id] = {
                    title: interaction.fields.getTextInputValue('titleInput'),
                    description: interaction.fields.getTextInputValue('descInput'),
                    verifiedRoleId: interaction.fields.getTextInputValue('verifiedRoleInput'),
                    unverifiedRoleId: interaction.fields.getTextInputValue('unverifiedRoleInput'),
                    rules: interaction.fields.getTextInputValue('rulesInput'),
                    successMessage: "Selamat datang! Anda telah berhasil diverifikasi.",
                    errorMessage: "Jawaban captcha salah. Silakan coba lagi.",
                    useCaptcha: true, // Default to true
                    captchaDifficulty: "mudah" // Default to easy
                };

                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await interaction.reply({ content: 'Pengaturan verifikasi berhasil disimpan!', ephemeral: true });
            }

            // Captcha Submit Modal
            if (interaction.customId.startsWith('captchaModal_')) {
                const userId = interaction.user.id;
                const storedAnswer = captchaAnswers.get(userId);
                const userAnswer = interaction.fields.getTextInputValue('captchaInput');

                if (userAnswer.toUpperCase() === storedAnswer.toUpperCase()) {
                    captchaAnswers.delete(userId);
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[interaction.guild.id];
                    const rulesEmbed = createRulesEmbed(config.rules);
                    const agreeButton = new ButtonBuilder()
                        .setCustomId('agreeToRules')
                        .setLabel('Saya Setuju')
                        .setStyle(ButtonStyle.Primary);
                    const row = new ActionRowBuilder().addComponents(agreeButton);

                    await interaction.reply({ embeds: [rulesEmbed], components: [row], ephemeral: true });
                } else {
                    const logEmbed = createLogEmbed('⚠️ Captcha Gagal', `Pengguna ${interaction.user} salah memasukkan captcha.`, interaction.user);
                    await logAction(interaction.guild, logEmbed);

                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[interaction.guild.id];
                    await interaction.reply({ embeds: [createErrorEmbed(config.errorMessage)], ephemeral: true });
                }
            }
        }

        // --- Button Interaction Handler ---
        else if (interaction.isButton()) {
            // Start Verification Button
            if (interaction.customId === 'startVerification') {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[interaction.guild.id];
                if (!config) return interaction.reply({ content: "Sistem verifikasi belum diatur di server ini.", ephemeral: true });

                if (interaction.member.roles.cache.has(config.verifiedRoleId)) {
                    return interaction.reply({ content: "Anda sudah terverifikasi!", ephemeral: true });
                }

                if (config.useCaptcha) {
                    const captcha = generateCaptcha(config.captchaDifficulty);
                    captchaAnswers.set(interaction.user.id, captcha.answer);

                    const modal = new ModalBuilder()
                        .setCustomId(`captchaModal_${interaction.user.id}`)
                        .setTitle('Verifikasi Captcha');
                    const captchaInput = new TextInputBuilder()
                        .setCustomId('captchaInput')
                        .setLabel(captcha.question)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    const row = new ActionRowBuilder().addComponents(captchaInput);
                    modal.addComponents(row);
                    await interaction.showModal(modal);

                } else { 
                    const rulesEmbed = createRulesEmbed(config.rules);
                    const agreeButton = new ButtonBuilder()
                        .setCustomId('agreeToRules')
                        .setLabel('Saya Setuju')
                        .setStyle(ButtonStyle.Primary);
                    const row = new ActionRowBuilder().addComponents(agreeButton);
                    await interaction.reply({ embeds: [rulesEmbed], components: [row], ephemeral: true });
                }
            }

            // Agree to Rules Button
            if (interaction.customId === 'agreeToRules') {
                await interaction.deferReply({ ephemeral: true });
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[interaction.guild.id];
                const member = interaction.member;

                try {
                    const verifiedRole = await interaction.guild.roles.fetch(config.verifiedRoleId);
                    const unverifiedRole = await interaction.guild.roles.fetch(config.unverifiedRoleId);

                    if (!verifiedRole) {
                        await interaction.editReply({ embeds: [createErrorEmbed(`Role terverifikasi (ID: ${config.verifiedRoleId}) tidak ditemukan.`)] });
                        return;
                    }
                    if (unverifiedRole) {
                        await member.roles.remove(unverifiedRole);
                    }
                    await member.roles.add(verifiedRole);
                    
                    const logEmbed = createLogEmbed('✅ Verifikasi Sukses', `Pengguna ${interaction.user} telah berhasil verifikasi dan mendapatkan role ${verifiedRole.name}.`, interaction.user);
                    await logAction(interaction.guild, logEmbed);
                    
                    await interaction.editReply({ embeds: [createSuccessEmbed(config.successMessage)] });

                } catch (error) {
                    console.error("Role Error:", error);
                    
                    const errorLog = createLogEmbed('❌ Kesalahan Kritis', `Gagal mengubah role untuk ${interaction.user}.\n**Error:** \`\`\`${error.message}\`\`\``, interaction.user);
                    await logAction(interaction.guild, errorLog);
                    
                    await interaction.editReply({ embeds: [createErrorEmbed("Terjadi kesalahan pada bot. Kemungkinan role tidak ditemukan atau bot tidak memiliki izin untuk mengelola role.")] });
                }
            }
        }
    },
};


