const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'testfixed',
        aliases: ['tf', 'testfix', 'testupgrade'],
        description: 'Testa as correções do sistema híbrido com logs detalhados',
        usage: '!testfixed [música para testar]'
    },

    async execute(message, args, client) {
        const testQuery = args.length > 0 ? args.join(' ') : 'never gonna give you up';
        
        const embed = MusicUtils.createInfoEmbed(
            'Teste das Correções do Sistema Híbrido',
            `🔧 Testando correções com: **${testQuery}**\n\n⚡ Verificando melhorias implementadas...\n\nAguarde um momento...`
        );
        
        const testMessage = await message.reply({ embeds: [embed] });

        let testResults = '**🔍 TESTE DAS CORREÇÕES IMPLEMENTADAS**\n\n';

        // 1. Testar Discord Player com múltiplos engines
        testResults += '**1️⃣ TESTE DO DISCORD PLAYER MELHORADO:**\n';
        
        if (client.hybridMusic && client.hybridMusic.isDiscordPlayerAvailable()) {
            try {
                // Simular o teste do Discord Player
                const player = client.hybridMusic.player;
                
                testResults += '✅ Discord Player disponível\n';
                
                // Testar diferentes engines
                const engines = ['youtube', 'auto', 'soundcloud', 'spotify'];
                let successCount = 0;
                
                for (const engine of engines) {
                    try {
                        testResults += `🔎 Testando engine "${engine}"... `;
                        
                        const searchResult = await player.search(testQuery, {
                            requestedBy: message.author,
                            searchEngine: engine
                        });
                        
                        if (searchResult && searchResult.tracks && searchResult.tracks.length > 0) {
                            testResults += `✅ (${searchResult.tracks.length} resultados)\n`;
                            successCount++;
                        } else {
                            testResults += `❌ (sem resultados)\n`;
                        }
                    } catch (engineError) {
                        testResults += `❌ (erro: ${engineError.message.substring(0, 50)}...)\n`;
                    }
                }
                
                testResults += `📊 Engines funcionando: ${successCount}/${engines.length}\n\n`;
                
            } catch (dpError) {
                testResults += `❌ Erro no Discord Player: ${dpError.message}\n\n`;
            }
        } else {
            testResults += '❌ Discord Player não disponível\n\n';
        }

        // 2. Testar extração melhorada de metadados
        testResults += '**2️⃣ TESTE DE EXTRAÇÃO DE METADADOS:**\n';
        
        if (client.hybridMusic) {
            try {
                // Testar com URL do YouTube
                const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                testResults += `🔗 Testando URL: ${testUrl}\n`;
                
                const urlInfo = await client.hybridMusic.extractYouTubeInfo(testUrl);
                
                if (urlInfo) {
                    testResults += `✅ Título: ${urlInfo.title}\n`;
                    testResults += `✅ Canal: ${urlInfo.channel}\n`;
                    testResults += `✅ Duração: ${urlInfo.duration}\n`;
                    testResults += `✅ Método: ${urlInfo.method}\n`;
                    testResults += `✅ Thumbnail: ${urlInfo.thumbnail ? 'Disponível' : 'N/A'}\n`;
                } else {
                    testResults += '❌ Falha na extração de metadados\n';
                }
                
            } catch (metaError) {
                testResults += `❌ Erro na extração: ${metaError.message}\n`;
            }
        } else {
            testResults += '❌ Sistema híbrido não disponível\n';
        }
        
        testResults += '\n';

        // 3. Testar sistema de fallback completo
        testResults += '**3️⃣ TESTE DO SISTEMA DE FALLBACK:**\n';
        
        if (client.hybridMusic) {
            try {
                const fallbackResult = await client.hybridMusic.trySearchFallback(testQuery);
                
                if (fallbackResult.success) {
                    testResults += `✅ Fallback funcionou!\n`;
                    testResults += `📝 Título: ${fallbackResult.song.title}\n`;
                    testResults += `🎵 Canal: ${fallbackResult.song.channel}\n`;
                    testResults += `⏱️ Duração: ${fallbackResult.song.duration}\n`;
                    testResults += `🔧 Método: ${fallbackResult.song.method}\n`;
                } else {
                    testResults += `❌ Fallback falhou: ${fallbackResult.error}\n`;
                }
                
            } catch (fallbackError) {
                testResults += `❌ Erro no fallback: ${fallbackError.message}\n`;
            }
        } else {
            testResults += '❌ Sistema híbrido não disponível\n';
        }
        
        testResults += '\n';

        // 4. Testar busca do YouTube direta
        testResults += '**4️⃣ TESTE DE BUSCA YOUTUBE DIRETA:**\n';
        
        try {
            const YouTube = require('youtube-sr').default;
            const directSearch = await YouTube.search(testQuery, { limit: 2, type: 'video' });
            
            if (directSearch.length > 0) {
                testResults += `✅ Busca direta funcionou (${directSearch.length} resultados)\n`;
                testResults += `📝 Primeiro resultado: ${directSearch[0].title}\n`;
                testResults += `🎵 Canal: ${directSearch[0].channel?.name || 'N/A'}\n`;
                testResults += `⏱️ Duração: ${directSearch[0].duration || 'N/A'}\n`;
            } else {
                testResults += '❌ Busca direta não retornou resultados\n';
            }
            
        } catch (directError) {
            testResults += `❌ Erro na busca direta: ${directError.message}\n`;
        }
        
        testResults += '\n';

        // 5. Verificar configurações e APIs
        testResults += '**5️⃣ VERIFICAÇÃO DE CONFIGURAÇÕES:**\n';
        
        testResults += `🔑 YouTube API Key: ${process.env.YOUTUBE_API_KEY ? 'Configurada' : 'Não configurada'}\n`;
        testResults += `🎵 Genius Token: ${process.env.GENIUS_ACCESS_TOKEN ? 'Configurado' : 'Não configurado'}\n`;
        
        // Verificar extractors carregados
        if (client.hybridMusic && client.hybridMusic.player) {
            try {
                const extractors = client.hybridMusic.player.extractors.store.map(ext => ext.identifier);
                testResults += `📦 Extractors: ${extractors.length > 0 ? extractors.join(', ') : 'Nenhum'}\n`;
            } catch (extError) {
                testResults += `📦 Extractors: Erro ao verificar\n`;
            }
        }
        
        testResults += '\n';

        // Resumo e recomendações
        testResults += '**📊 RESUMO E RECOMENDAÇÕES:**\n';
        
        if (client.hybridMusic && client.hybridMusic.isDiscordPlayerAvailable()) {
            testResults += '✅ Sistema híbrido está funcionando\n';
            testResults += '💡 Use `!playhybrid` para melhor experiência\n';
        } else {
            testResults += '❌ Sistema híbrido com problemas\n';
            testResults += '💡 Reinicie o bot ou verifique dependências\n';
        }
        
        if (process.env.YOUTUBE_API_KEY) {
            testResults += '✅ API do YouTube disponível para metadados\n';
        } else {
            testResults += '⚠️ Configure YOUTUBE_API_KEY para melhor extração de metadados\n';
        }

        // Atualizar embed com resultados
        const finalEmbed = MusicUtils.createInfoEmbed(
            'Resultado do Teste das Correções',
            testResults
        );

        // Definir cor baseada no status geral
        if (client.hybridMusic && client.hybridMusic.isDiscordPlayerAvailable()) {
            finalEmbed.setColor('#00FF00'); // Verde - funcionando
        } else {
            finalEmbed.setColor('#FFA500'); // Laranja - problemas
        }

        await testMessage.edit({ embeds: [finalEmbed] });
    }
};
