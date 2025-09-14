const MusicUtils = require('../utils/musicUtils');
const YouTube = require('youtube-sr').default;

module.exports = {
    data: {
        name: 'searchonly',
        aliases: ['so', 'find', 'lookup'],
        description: 'Busca músicas sem tentar reproduzir (apenas para teste)',
        usage: '!searchonly <música/link>'
    },

    async execute(message, args, client) {
        if (!args.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Parâmetro Obrigatório',
                'Por favor, forneça o nome da música ou um link!\n\n**Exemplo:** `!searchonly Never Gonna Give You Up`'
            );
            return message.reply({ embeds: [embed] });
        }

        const query = args.join(' ');

        // Mostrar mensagem de carregamento
        const loadingEmbed = MusicUtils.createInfoEmbed(
            'Buscando Música',
            `🔍 Procurando: **${query}**\n\n⚡ Testando apenas a busca (sem reprodução)...\n\nAguarde um momento...`
        );
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });

        try {
            // Testar múltiplos métodos de busca
            let results = [];
            let errors = [];

            // Método 1: Busca padrão
            try {
                console.log('🔍 Testando busca padrão...');
                const standardSearch = await YouTube.search(query, { limit: 3, type: 'video' });
                if (standardSearch.length > 0) {
                    results.push({
                        method: 'Busca Padrão',
                        success: true,
                        count: standardSearch.length,
                        first: standardSearch[0]
                    });
                } else {
                    results.push({
                        method: 'Busca Padrão',
                        success: false,
                        error: 'Nenhum resultado'
                    });
                }
            } catch (error) {
                errors.push({ method: 'Busca Padrão', error: error.message });
            }

            // Método 2: Busca com safeSearch desabilitado
            try {
                console.log('🔍 Testando busca sem filtros...');
                const unsafeSearch = await YouTube.search(query, { 
                    limit: 2, 
                    type: 'video',
                    safeSearch: false 
                });
                if (unsafeSearch.length > 0) {
                    results.push({
                        method: 'Busca Sem Filtros',
                        success: true,
                        count: unsafeSearch.length,
                        first: unsafeSearch[0]
                    });
                }
            } catch (error) {
                errors.push({ method: 'Busca Sem Filtros', error: error.message });
            }

            // Método 3: Busca simplificada (se for URL)
            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                try {
                    console.log('🔗 Testando análise de URL...');
                    const videoId = this.extractVideoId(query);
                    if (videoId) {
                        results.push({
                            method: 'Análise de URL',
                            success: true,
                            videoId: videoId,
                            url: `https://www.youtube.com/watch?v=${videoId}`
                        });
                    }
                } catch (error) {
                    errors.push({ method: 'Análise de URL', error: error.message });
                }
            }

            // Criar embed com resultados
            let resultText = `**🔍 Resultados da busca para:** "${query}"\n\n`;

            // Mostrar sucessos
            if (results.length > 0) {
                resultText += '**✅ MÉTODOS QUE FUNCIONARAM:**\n';
                results.forEach(result => {
                    if (result.success) {
                        resultText += `• **${result.method}**: `;
                        if (result.first) {
                            resultText += `Encontrou "${result.first.title}" (${result.count} resultados)\n`;
                        } else if (result.videoId) {
                            resultText += `ID do vídeo: ${result.videoId}\n`;
                        } else {
                            resultText += `Sucesso\n`;
                        }
                    }
                });
                resultText += '\n';
            }

            // Mostrar erros
            if (errors.length > 0) {
                resultText += '**❌ MÉTODOS QUE FALHARAM:**\n';
                errors.forEach(error => {
                    resultText += `• **${error.method}**: ${error.error}\n`;
                });
                resultText += '\n';
            }

            // Mostrar detalhes do melhor resultado
            const bestResult = results.find(r => r.success && r.first);
            if (bestResult) {
                const song = bestResult.first;
                resultText += '**🎵 MELHOR RESULTADO:**\n';
                resultText += `• **Título:** ${song.title}\n`;
                resultText += `• **Canal:** ${song.channel?.name || 'Desconhecido'}\n`;
                resultText += `• **Duração:** ${song.duration || 'Desconhecida'}\n`;
                resultText += `• **URL:** [Clique aqui](${song.url})\n\n`;
            }

            // Status geral
            const successCount = results.filter(r => r.success).length;
            const totalMethods = results.length + errors.length;
            
            resultText += `**📊 RESUMO:**\n`;
            resultText += `• Métodos testados: ${totalMethods}\n`;
            resultText += `• Sucessos: ${successCount}\n`;
            resultText += `• Falhas: ${errors.length}\n\n`;

            if (successCount > 0) {
                resultText += '✅ **A busca está funcionando!** O problema pode estar na reprodução.\n';
                resultText += 'Use `!testhybrid` para diagnóstico completo.';
            } else {
                resultText += '❌ **Todos os métodos de busca falharam.** Problema na conectividade ou APIs.';
            }

            const finalEmbed = MusicUtils.createInfoEmbed(
                'Resultado do Teste de Busca',
                resultText
            );

            // Definir cor baseada no sucesso
            if (successCount > 0) {
                finalEmbed.setColor('#00FF00');
            } else {
                finalEmbed.setColor('#FF0000');
            }

            // Adicionar thumbnail se houver
            if (bestResult && bestResult.first && bestResult.first.thumbnail) {
                finalEmbed.setThumbnail(bestResult.first.thumbnail.url);
            }

            await loadingMessage.edit({ embeds: [finalEmbed] });

        } catch (error) {
            console.error('Erro no comando searchonly:', error);
            
            const errorEmbed = MusicUtils.createErrorEmbed(
                'Erro no Teste de Busca',
                `❌ Houve um erro inesperado durante o teste.\n\n**Erro:** ${error.message}\n\n**Stack:** ${error.stack?.substring(0, 200) || 'N/A'}`
            );
            
            await loadingMessage.edit({ embeds: [errorEmbed] });
        }
    },

    // Função auxiliar para extrair ID do vídeo
    extractVideoId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
};
