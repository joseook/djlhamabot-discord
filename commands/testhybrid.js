const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'testhybrid',
        aliases: ['th', 'testmusic', 'diagmusic'],
        description: 'Testa e diagnostica o sistema híbrido de música',
        usage: '!testhybrid [música para testar]'
    },

    async execute(message, args, client) {
        const embed = MusicUtils.createInfoEmbed(
            'Diagnóstico do Sistema Híbrido',
            '🔧 Iniciando diagnóstico completo do sistema de música...'
        );
        
        const diagnosticMessage = await message.reply({ embeds: [embed] });

        // Verificações básicas
        const results = {
            hybridSystem: '❌',
            discordPlayer: '❌',
            youtubeSearch: '❌',
            fallbackMethods: '❌',
            voicePermissions: '❌'
        };

        let diagnosticText = '**🔍 DIAGNÓSTICO DO SISTEMA HÍBRIDO**\n\n';

        // 1. Verificar sistema híbrido
        try {
            if (client.hybridMusic) {
                results.hybridSystem = '✅';
                diagnosticText += '✅ Sistema híbrido: Inicializado\n';
                
                // Verificar Discord Player
                if (client.hybridMusic.isDiscordPlayerAvailable()) {
                    results.discordPlayer = '✅';
                    diagnosticText += '✅ Discord Player: Disponível\n';
                } else {
                    diagnosticText += '❌ Discord Player: Não disponível\n';
                }
            } else {
                diagnosticText += '❌ Sistema híbrido: Não inicializado\n';
            }
        } catch (error) {
            diagnosticText += `❌ Sistema híbrido: Erro - ${error.message}\n`;
        }

        // 2. Testar busca do YouTube
        try {
            const YouTube = require('youtube-sr').default;
            const testQuery = args.length > 0 ? args.join(' ') : 'test music';
            
            diagnosticText += `\n🔍 **Testando busca:** "${testQuery}"\n`;
            
            const searchResult = await YouTube.search(testQuery, { limit: 1, type: 'video' });
            
            if (searchResult && searchResult.length > 0) {
                results.youtubeSearch = '✅';
                diagnosticText += `✅ YouTube Search: Encontrou "${searchResult[0].title}"\n`;
            } else {
                diagnosticText += '❌ YouTube Search: Nenhum resultado\n';
            }
        } catch (searchError) {
            diagnosticText += `❌ YouTube Search: Erro - ${searchError.message}\n`;
        }

        // 3. Testar métodos de fallback
        if (client.hybridMusic) {
            try {
                const testQuery = args.length > 0 ? args.join(' ') : 'never gonna give you up';
                const fallbackResult = await client.hybridMusic.trySearchFallback(testQuery);
                
                if (fallbackResult.success) {
                    results.fallbackMethods = '✅';
                    diagnosticText += `✅ Fallback: Sucesso - ${fallbackResult.song.method}\n`;
                } else {
                    diagnosticText += `❌ Fallback: Falhou - ${fallbackResult.error}\n`;
                }
            } catch (fallbackError) {
                diagnosticText += `❌ Fallback: Erro - ${fallbackError.message}\n`;
            }
        }

        // 4. Verificar permissões de voz
        try {
            const voiceChannel = message.member.voice.channel;
            if (voiceChannel) {
                const permissions = voiceChannel.permissionsFor(message.guild.members.me);
                if (permissions.has(['Connect', 'Speak'])) {
                    results.voicePermissions = '✅';
                    diagnosticText += '✅ Permissões de voz: OK\n';
                } else {
                    diagnosticText += '❌ Permissões de voz: Insuficientes\n';
                }
            } else {
                diagnosticText += '⚠️ Permissões de voz: Usuário não está em canal de voz\n';
            }
        } catch (permError) {
            diagnosticText += `❌ Permissões de voz: Erro - ${permError.message}\n`;
        }

        // 5. Status geral
        const workingSystems = Object.values(results).filter(r => r === '✅').length;
        const totalSystems = Object.keys(results).length;
        
        diagnosticText += `\n**📊 RESUMO:**\n`;
        diagnosticText += `Sistemas funcionando: ${workingSystems}/${totalSystems}\n\n`;

        // Recomendações
        diagnosticText += '**💡 RECOMENDAÇÕES:**\n';
        
        if (results.hybridSystem === '❌') {
            diagnosticText += '• Reinicie o bot para inicializar o sistema híbrido\n';
        }
        
        if (results.discordPlayer === '❌') {
            diagnosticText += '• Instale as dependências: `npm install discord-player`\n';
        }
        
        if (results.youtubeSearch === '❌') {
            diagnosticText += '• Problema na busca do YouTube - pode ser temporário\n';
        }
        
        if (results.fallbackMethods === '❌') {
            diagnosticText += '• Todos os métodos de fallback falharam - problema grave\n';
        }
        
        if (results.voicePermissions === '❌') {
            diagnosticText += '• Verifique as permissões do bot no canal de voz\n';
        }

        // Status das dependências
        diagnosticText += '\n**📦 DEPENDÊNCIAS:**\n';
        try {
            const pkg = require('../package.json');
            diagnosticText += `• discord.js: ${pkg.dependencies['discord.js'] || 'N/A'}\n`;
            diagnosticText += `• discord-player: ${pkg.dependencies['discord-player'] || 'N/A'}\n`;
            diagnosticText += `• youtube-sr: ${pkg.dependencies['youtube-sr'] || 'N/A'}\n`;
        } catch (pkgError) {
            diagnosticText += '• Erro ao ler package.json\n';
        }

        // Atualizar embed com resultados
        const finalEmbed = MusicUtils.createInfoEmbed(
            'Diagnóstico Completo do Sistema Híbrido',
            diagnosticText
        );

        // Cor baseada no status
        if (workingSystems >= 4) {
            finalEmbed.setColor('#00FF00'); // Verde - tudo funcionando
        } else if (workingSystems >= 2) {
            finalEmbed.setColor('#FFA500'); // Laranja - parcialmente funcionando
        } else {
            finalEmbed.setColor('#FF0000'); // Vermelho - problemas graves
        }

        await diagnosticMessage.edit({ embeds: [finalEmbed] });
    }
};
