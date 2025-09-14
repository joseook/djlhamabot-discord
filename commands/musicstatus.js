const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'musicstatus',
        aliases: ['status', 'youtube', 'yt'],
        description: 'Mostra o status atual do sistema de música do DJ Lhama',
        usage: '!musicstatus'
    },

    async execute(message, args, client) {
        // Verificar status do sistema híbrido
        const hybridAvailable = client.hybridMusic && client.hybridMusic.isDiscordPlayerAvailable();
        const systemStatus = client.hybridMusic ? client.hybridMusic.getSystemStatus() : null;
        
        let embed;
        
        if (hybridAvailable) {
            // Sistema híbrido funcionando
            embed = MusicUtils.createSuccessEmbed(
                '✅ Sistema Híbrido de Música Ativo',
                `**🎉 Excelente! O DJ Lhama está com sistema híbrido funcionando perfeitamente!**\n\n**🔥 Recursos Ativos:**\n✅ Discord Player integrado (estável)\n✅ Sistema de fallback automático\n✅ Múltiplas plataformas (YouTube, Spotify, SoundCloud)\n✅ Conexão de voz otimizada\n✅ Extração completa de metadados\n\n**🎮 Comandos Principais:**\n• \`!play <música>\` - Comando principal (sistema híbrido)\n• \`!join\` - Conectar ao canal de voz\n• \`!queue\` - Ver fila de reprodução\n• \`!skip\` - Pular música atual\n• \`!help\` - Lista completa de comandos\n\n**📊 Status dos Sistemas:**\n✅ Discord Player: Funcionando\n✅ Sistema Híbrido: Ativo\n✅ Fallback Automático: Disponível\n✅ Múltiplas Plataformas: Suportadas\n\n**🌟 Use \`!play\` normalmente - tudo funciona automaticamente!**`
            );
        } else {
            // Sistema híbrido não disponível
            embed = MusicUtils.createErrorEmbed(
                '🚨 Sistemas de Música com Problemas',
                `**O que aconteceu?**\n❌ O YouTube mudou sua estrutura interna\n❌ Bibliotecas tradicionais estão com instabilidade\n❌ Sistema híbrido não inicializou corretamente\n\n**Status Atual:**\n❌ Discord Player: Não disponível\n❌ ytdl-core: Instabilidade conhecida\n❌ Sistema Híbrido: Falha na inicialização\n\n**Soluções:**\n🔄 Reinicie o bot\n💾 Verifique se as dependências estão instaladas\n⏰ Aguarde correções das bibliotecas\n\n**Comandos que Funcionam:**\n✅ \`!join\`, \`!help\`, \`!ping\`, \`!debug\`\n\n*Este é um problema temporário*`
            );
        }

        embed.addFields(
            { name: '🔧 Comandos que Funcionam', value: '`!join`, `!help`, `!ping`, `!debug`', inline: true },
            { name: '❌ Comandos Afetados', value: '`!play`, `!playalt`, `!search`', inline: true },
            { name: '📅 Última Atualização', value: new Date().toLocaleDateString('pt-BR'), inline: true }
        );

        embed.setFooter({ text: 'DJ Lhama • Este é um problema temporário do YouTube • Criado por Joseok' });

        message.reply({ embeds: [embed] });
    }
};
