const { EmbedBuilder } = require('discord.js');
const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'help',
        aliases: ['ajuda', 'comandos', 'h'],
        description: 'Mostra todos os comandos disponíveis ou informações sobre um comando específico',
        usage: '!help [comando]'
    },

    async execute(message, args, client) {
        const prefix = client.config.prefix;

        if (args.length > 0) {
            // Mostrar ajuda para comando específico
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || 
                           client.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName));

            if (!command) {
                const embed = MusicUtils.createErrorEmbed(
                    'Comando Não Encontrado',
                    `Comando \`${commandName}\` não foi encontrado.\n\nUse \`${prefix}help\` para ver todos os comandos disponíveis.`
                );
                return message.reply({ embeds: [embed] });
            }

            const embed = MusicUtils.createInfoEmbed(
                `Comando: ${command.data.name}`,
                `**Descrição:** ${command.data.description}\n**Uso:** \`${command.data.usage}\`${command.data.aliases ? `\n**Aliases:** ${command.data.aliases.map(alias => `\`${alias}\``).join(', ')}` : ''}`
            );

            return message.reply({ embeds: [embed] });
        }

        // Mostrar todos os comandos
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🦙 DJ Lhama - Sistema Híbrido Ativo!')
            .setDescription(`**🎉 Excelente! O sistema híbrido está funcionando perfeitamente!**\n\n*Criado com ❤️ por **Joseok***\n\n**🌟 Use \`${prefix}play\` normalmente - tudo funciona automaticamente!**`)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {
                    name: '🎵 **Comandos Principais de Música**',
                    value: [
                        `\`${prefix}play <música>\` - 🎆 **Comando principal** (YouTube, Spotify, SoundCloud)`,
                        `\`${prefix}skip\` - Pula a música atual`,
                        `\`${prefix}stop\` - Para a música e desconecta`,
                        `\`${prefix}pause\` - Pausa a música`,
                        `\`${prefix}resume\` - Retoma a música`,
                        `\`${prefix}nowplaying\` - Mostra a música atual`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📋 **Gerenciamento de Fila**',
                    value: [
                        `\`${prefix}queue\` - Mostra a fila de músicas`,
                        `\`${prefix}shuffle\` - Embaralha a fila`,
                        `\`${prefix}loop\` - Alterna modo de repetição`,
                        `\`${prefix}remove <número>\` - Remove música da fila`,
                        `\`${prefix}clearqueue\` - Limpa a fila (Admin)`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🔧 **Controles e Configurações**',
                    value: [
                        `\`${prefix}join\` - Conecta ao seu canal de voz`,
                        `\`${prefix}volume <0-100>\` - Ajusta o volume`,
                        `\`${prefix}lyrics\` - Mostra a letra da música`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📊 **Informações e Status**',
                    value: [
                        `\`${prefix}help\` - Mostra esta mensagem`,
                        `\`${prefix}ping\` - Verifica latência do bot`,
                        `\`${prefix}musicstatus\` - Status do sistema híbrido`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '✨ **Novidades do Sistema Híbrido**',
                    value: [
                        '✅ Múltiplas plataformas (YouTube, Spotify, SoundCloud)',
                        '✅ Fallback automático inteligente',
                        '✅ Conexão de voz otimizada',
                        '✅ Extração completa de metadados',
                        '✅ Sistema estável e robusto'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📊 **Informações**',
                    value: `Prefixo atual: \`${prefix}\`\nVersão: 1.0.0`,
                    inline: true
                },
                {
                    name: '🔗 **Links Úteis**',
                    value: '[Adicionar ao Servidor](https://discord.com/developers/applications) • [Suporte](https://github.com)',
                    inline: true
                }
            )
            .setFooter({ text: 'DJ Lhama • Criado por Joseok • Use os comandos em um canal de voz!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
