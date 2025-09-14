const { PermissionsBitField } = require('discord.js');
const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'debug',
        aliases: ['diagnostico', 'info'],
        description: 'Comando de diagnóstico completo do DJ Lhama',
        usage: '!debug'
    },

    async execute(message, args, client) {
        console.log('🔧 Comando debug executado com sucesso!');
        
        const guild = message.guild;
        const member = message.member;
        const channel = message.channel;
        const botMember = guild.members.me;

        let debugInfo = `**🔧 Diagnóstico Completo do DJ Lhama**\n\n`;
        
        // Informações básicas
        debugInfo += `**📊 Informações Básicas:**\n`;
        debugInfo += `• Bot: ${client.user.tag}\n`;
        debugInfo += `• Servidor: ${guild.name}\n`;
        debugInfo += `• Canal: ${channel.name}\n`;
        debugInfo += `• Usuário: ${member.user.tag}\n`;
        debugInfo += `• Prefixo: ${client.config.prefix}\n`;
        debugInfo += `• Comandos carregados: ${client.commands.size}\n\n`;

        // Permissões do bot
        debugInfo += `**🔑 Permissões do Bot:**\n`;
        if (botMember) {
            const permissions = botMember.permissions.toArray();
            const hasViewChannels = botMember.permissionsIn(channel).has(PermissionsBitField.Flags.ViewChannel);
            const hasSendMessages = botMember.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages);
            const hasEmbedLinks = botMember.permissionsIn(channel).has(PermissionsBitField.Flags.EmbedLinks);
            
            debugInfo += `• Ver Canal: ${hasViewChannels ? '✅' : '❌'}\n`;
            debugInfo += `• Enviar Mensagens: ${hasSendMessages ? '✅' : '❌'}\n`;
            debugInfo += `• Incorporar Links: ${hasEmbedLinks ? '✅' : '❌'}\n`;
            debugInfo += `• Total de permissões: ${permissions.length}\n\n`;
        } else {
            debugInfo += `❌ Bot não encontrado como membro\n\n`;
        }

        // Status de voz
        debugInfo += `**🎤 Status de Voz:**\n`;
        if (member.voice.channel) {
            debugInfo += `• Usuário no canal: ${member.voice.channel.name}\n`;
            const hasConnect = botMember.permissionsIn(member.voice.channel).has(PermissionsBitField.Flags.Connect);
            const hasSpeak = botMember.permissionsIn(member.voice.channel).has(PermissionsBitField.Flags.Speak);
            debugInfo += `• Bot pode conectar: ${hasConnect ? '✅' : '❌'}\n`;
            debugInfo += `• Bot pode falar: ${hasSpeak ? '✅' : '❌'}\n`;
        } else {
            debugInfo += `• Usuário não está em canal de voz\n`;
        }

        // Conexões ativas
        const hasConnection = client.connections.has(guild.id);
        const hasPlayer = client.players.has(guild.id);
        const hasQueue = client.queues.has(guild.id);
        
        debugInfo += `\n**🎵 Status de Música:**\n`;
        debugInfo += `• Conexão ativa: ${hasConnection ? '✅' : '❌'}\n`;
        debugInfo += `• Player ativo: ${hasPlayer ? '✅' : '❌'}\n`;
        debugInfo += `• Fila existe: ${hasQueue ? '✅' : '❌'}\n`;

        if (hasQueue) {
            const queue = client.queues.get(guild.id);
            debugInfo += `• Músicas na fila: ${queue.length}\n`;
        }

        const embed = MusicUtils.createInfoEmbed(
            'Diagnóstico Completo',
            debugInfo
        );

        embed.addFields(
            { name: '🏓 Latência', value: `${client.ws.ping}ms`, inline: true },
            { name: '⏰ Uptime', value: `${Math.floor(client.uptime / 1000)}s`, inline: true },
            { name: '🔧 Versão', value: '1.0.0', inline: true }
        );

        message.reply({ embeds: [embed] });
    }
};
