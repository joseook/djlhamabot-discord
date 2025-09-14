const MusicUtils = require('../utils/musicUtils');
const YouTube = require('youtube-sr').default;

module.exports = {
    data: {
        name: 'search',
        aliases: ['buscar', 'find'],
        description: 'Busca músicas no YouTube e permite escolher qual tocar',
        usage: '!search <nome da música>'
    },

    async execute(message, args, client) {
        // Aviso sobre indisponibilidade do YouTube
        const embed = MusicUtils.createErrorEmbed(
            '🚨 Comando Temporariamente Indisponível',
            `❌ **O sistema de música está temporariamente fora do ar**\n\n**Motivo:** YouTube quebrou todas as bibliotecas de música\n**Duração:** Problema temporário (1-7 dias)\n**Afeta:** Todos os bots de música do Discord\n\n**Use:** \`!musicstatus\` para mais detalhes\n\n*Assim que o YouTube for corrigido, este comando voltará a funcionar*`
        );
        return message.reply({ embeds: [embed] });
        
        // TODO: Reativar quando o YouTube for corrigido
        // O código original foi temporariamente desabilitado

        if (!args.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Parâmetro Obrigatório',
                'Por favor, forneça o nome da música para buscar!\n\n**Exemplo:** `!search Never Gonna Give You Up`'
            );
            return message.reply({ embeds: [embed] });
        }

        const query = args.join(' ');

        const loadingEmbed = MusicUtils.createInfoEmbed(
            'Buscando Músicas',
            `🔍 Procurando por: **${query}**\n\nAguarde um momento...`
        );
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });

        try {
            const results = await YouTube.search(query, { limit: 5, type: 'video' });

            if (!results.length) {
                const embed = MusicUtils.createErrorEmbed(
                    'Nenhum Resultado',
                    `❌ Não foi possível encontrar músicas para: **${query}**\n\nTente usar termos de busca diferentes.`
                );
                return loadingMessage.edit({ embeds: [embed] });
            }

            let description = 'Escolha uma música digitando o número correspondente (1-5):\n\n';
            
            results.forEach((song, index) => {
                const duration = song.duration ? MusicUtils.formatDuration(song.duration) : 'Ao vivo';
                description += `**${index + 1}.** [${song.title}](${song.url})\n`;
                description += `🎤 ${song.channel?.name || 'Desconhecido'} • ⏱️ ${duration}\n\n`;
            });

            const embed = MusicUtils.createMusicEmbed(
                `🎵 Resultados da Busca: ${query}`,
                description
            );

            embed.setFooter({ text: 'Digite um número de 1-5 nos próximos 30 segundos • DJ Lhama • Criado por Joseok' });

            await loadingMessage.edit({ embeds: [embed] });

            // Aguardar resposta do usuário
            const filter = (response) => {
                const num = parseInt(response.content);
                return response.author.id === message.author.id && 
                       !isNaN(num) && 
                       num >= 1 && 
                       num <= results.length;
            };

            const collector = message.channel.createMessageCollector({ 
                filter, 
                max: 1, 
                time: 30000 
            });

            collector.on('collect', async (response) => {
                const choice = parseInt(response.content) - 1;
                const selectedSong = results[choice];

                // Usar o comando play para tocar a música selecionada
                const playCommand = client.commands.get('play');
                if (playCommand) {
                    // Simular argumentos para o comando play
                    const fakeArgs = [selectedSong.url];
                    await playCommand.execute(message, fakeArgs, client);
                }

                response.delete().catch(() => {}); // Deletar a resposta do usuário
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    const timeoutEmbed = MusicUtils.createInfoEmbed(
                        'Tempo Esgotado',
                        '⏰ Você não selecionou nenhuma música a tempo.\n\nUse `!search` novamente para fazer uma nova busca.'
                    );
                    
                    loadingMessage.edit({ embeds: [timeoutEmbed] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Erro na busca:', error);
            
            const embed = MusicUtils.createErrorEmbed(
                'Erro na Busca',
                `❌ Ocorreu um erro ao buscar: **${query}**\n\nTente novamente mais tarde.`
            );
            
            loadingMessage.edit({ embeds: [embed] });
        }
    }
};
