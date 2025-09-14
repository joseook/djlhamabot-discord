const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'play',
        aliases: ['p', 'tocar'],
        description: 'Toca uma música usando o sistema híbrido avançado (YouTube, Spotify, SoundCloud)',
        usage: '!play <música/link>'
    },

    async execute(message, args, client) {
        // Verificações básicas
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para usar este comando!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Parâmetro Obrigatório',
                'Por favor, forneça o nome da música ou um link!\n\n**Exemplo:** `!play Never Gonna Give You Up`\n\n🎵 **Suporte a múltiplas plataformas:**\n• YouTube (links e busca)\n• Spotify (links)\n• SoundCloud (links e busca)\n• Apple Music (links)\n\n✨ *Sistema híbrido com fallback automático*'
            );
            return message.reply({ embeds: [embed] });
        }

        const query = args.join(' ');

        // Verificar se o sistema híbrido está disponível
        if (!client.hybridMusic) {
            const embed = MusicUtils.createErrorEmbed(
                'Sistema de Música Indisponível',
                '❌ O sistema híbrido de música não foi inicializado corretamente.\n\nTente reiniciar o bot ou use `!musicstatus` para mais informações.'
            );
            return message.reply({ embeds: [embed] });
        }

        // Mostrar mensagem de carregamento
        const loadingEmbed = MusicUtils.createInfoEmbed(
            'Processando Música',
            `🔍 Buscando: **${query}**\n\n⚡ **Sistema Híbrido Ativo:**\n• Discord Player (principal)\n• Fallback automático\n• Múltiplas plataformas\n\nAguarde um momento...`
        );
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });

        try {
            // Usar o sistema híbrido
            const resultEmbed = await client.hybridMusic.playMusic(message, query);
            
            // Atualizar a mensagem com o resultado
            await loadingMessage.edit({ embeds: [resultEmbed] });

        } catch (error) {
            console.error('Erro no comando play:', error);
            
            const errorEmbed = MusicUtils.createErrorEmbed(
                'Erro no Sistema de Música',
                `❌ Houve um erro inesperado no sistema de música.\n\n**Erro:** ${error.message}\n\n**Soluções:**\n• Tente novamente\n• Use \`!musicstatus\` para verificar o status\n• Reinicie o bot se o problema persistir\n\n*Sistema híbrido com múltiplos fallbacks*`
            );
            
            await loadingMessage.edit({ embeds: [errorEmbed] });
        }
    }
};
