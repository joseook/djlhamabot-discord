const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'playhybrid',
        aliases: ['ph', 'playh', 'playsafe'],
        description: 'Toca música usando o sistema híbrido (Discord Player + fallbacks)',
        usage: '!playhybrid <música/link>'
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
                'Por favor, forneça o nome da música ou um link!\n\n**Exemplo:** `!playhybrid Never Gonna Give You Up`\n\n*Este comando usa o sistema híbrido mais estável*'
            );
            return message.reply({ embeds: [embed] });
        }

        const query = args.join(' ');

        // Verificar se o sistema híbrido está disponível
        if (!client.hybridMusic) {
            const embed = MusicUtils.createErrorEmbed(
                'Sistema Híbrido Indisponível',
                '❌ O sistema híbrido de música não foi inicializado corretamente.\n\nTente usar outros comandos de música ou reinicie o bot.'
            );
            return message.reply({ embeds: [embed] });
        }

        // Mostrar mensagem de carregamento
        const loadingEmbed = MusicUtils.createInfoEmbed(
            'Processando Música',
            `🔍 Buscando: **${query}**\n\n⚡ Usando sistema híbrido inteligente...\n• Tentando Discord Player primeiro\n• Fallback automático se necessário\n\nAguarde um momento...`
        );
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });

        try {
            // Usar o sistema híbrido
            const resultEmbed = await client.hybridMusic.playMusic(message, query);
            
            // Atualizar a mensagem com o resultado
            await loadingMessage.edit({ embeds: [resultEmbed] });

        } catch (error) {
            console.error('Erro no comando playhybrid:', error);
            
            const errorEmbed = MusicUtils.createErrorEmbed(
                'Erro no Sistema Híbrido',
                `❌ Houve um erro inesperado no sistema híbrido.\n\n**Erro:** ${error.message}\n\n**Soluções:**\n• Tente novamente\n• Use \`!musicstatus\` para verificar o status\n• Reinicie o bot se o problema persistir`
            );
            
            await loadingMessage.edit({ embeds: [errorEmbed] });
        }
    }
};
