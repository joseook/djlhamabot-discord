const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'testvoice',
        aliases: ['tv', 'testvoz', 'testconnection'],
        description: 'Testa especificamente a conexão de voz e reprodução de áudio',
        usage: '!testvoice [música para testar]'
    },

    async execute(message, args, client) {
        // Verificar se o usuário está em um canal de voz
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para testar a conexão!'
            );
            return message.reply({ embeds: [embed] });
        }

        const testQuery = args.length > 0 ? args.join(' ') : 'never gonna give you up';
        
        const embed = MusicUtils.createInfoEmbed(
            'Teste de Conexão de Voz',
            `🔧 Testando conexão de voz com: **${testQuery}**\n\n⚡ Verificando correções do AbortError...\n\nAguarde um momento...`
        );
        
        const testMessage = await message.reply({ embeds: [embed] });

        let testResults = '**🔊 TESTE DE CONEXÃO DE VOZ**\n\n';

        // Verificar sistema híbrido
        if (!client.hybridMusic || !client.hybridMusic.isDiscordPlayerAvailable()) {
            testResults += '❌ Sistema híbrido não disponível\n';
            const errorEmbed = MusicUtils.createErrorEmbed(
                'Sistema Indisponível',
                testResults
            );
            return testMessage.edit({ embeds: [errorEmbed] });
        }

        const voiceChannel = message.member.voice.channel;
        testResults += `✅ Canal de voz: ${voiceChannel.name}\n`;
        testResults += `👥 Usuários no canal: ${voiceChannel.members.size}\n\n`;

        try {
            // Fase 1: Buscar música
            testResults += '**1️⃣ FASE: BUSCA DE MÚSICA**\n';
            
            const player = client.hybridMusic.player;
            const searchResult = await player.search(testQuery, {
                requestedBy: message.author,
                searchEngine: 'youtube'
            });

            if (!searchResult || !searchResult.tracks || !searchResult.tracks.length) {
                testResults += '❌ Falha na busca de música\n';
                const errorEmbed = MusicUtils.createErrorEmbed(
                    'Falha na Busca',
                    testResults
                );
                return testMessage.edit({ embeds: [errorEmbed] });
            }

            const track = searchResult.tracks[0];
            testResults += `✅ Música encontrada: ${track.title}\n`;
            testResults += `🎵 Autor: ${track.author}\n`;
            testResults += `⏱️ Duração: ${track.duration}\n\n`;

            // Atualizar progresso
            const progressEmbed = MusicUtils.createInfoEmbed(
                'Teste de Conexão de Voz - Progresso',
                testResults + '**2️⃣ FASE: CRIAÇÃO DA FILA**\n🔄 Criando fila de reprodução...'
            );
            await testMessage.edit({ embeds: [progressEmbed] });

            // Fase 2: Criar fila
            testResults += '**2️⃣ FASE: CRIAÇÃO DA FILA**\n';
            
            let queue = player.nodes.get(message.guild.id);
            
            if (queue) {
                testResults += '⚠️ Fila já existe, destruindo...\n';
                queue.delete();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            queue = player.nodes.create(message.guild, {
                metadata: {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel
                },
                selfDeaf: true,
                volume: 50,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 300000,
                // Configurações anti-AbortError
                connectionTimeout: 30000,
                maxSize: 100,
                maxHistorySize: 100,
                bufferingTimeout: 3000,
                disableVolume: false
            });

            testResults += '✅ Fila criada com configurações anti-AbortError\n\n';

            // Atualizar progresso
            const progressEmbed2 = MusicUtils.createInfoEmbed(
                'Teste de Conexão de Voz - Progresso',
                testResults + '**3️⃣ FASE: CONEXÃO DE VOZ**\n🔄 Conectando ao canal de voz...'
            );
            await testMessage.edit({ embeds: [progressEmbed2] });

            // Fase 3: Conectar ao canal de voz
            testResults += '**3️⃣ FASE: CONEXÃO DE VOZ**\n';
            
            if (!queue.connection) {
                let connectionAttempts = 0;
                const maxAttempts = 3;
                let connected = false;
                
                while (connectionAttempts < maxAttempts && !connected) {
                    try {
                        connectionAttempts++;
                        testResults += `🔗 Tentativa ${connectionAttempts}/${maxAttempts}...\n`;
                        
                        await queue.connect(voiceChannel, {
                            deaf: true,
                            maxTime: 30000
                        });
                        
                        connected = true;
                        testResults += '✅ Conexão estabelecida com sucesso!\n';
                        
                    } catch (connectError) {
                        testResults += `❌ Tentativa ${connectionAttempts} falhou: ${connectError.message}\n`;
                        
                        if (connectionAttempts < maxAttempts) {
                            testResults += '⏳ Aguardando 2 segundos antes da próxima tentativa...\n';
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                }
                
                if (!connected) {
                    testResults += '\n❌ **FALHA CRÍTICA: Não foi possível conectar ao canal de voz**\n';
                    const errorEmbed = MusicUtils.createErrorEmbed(
                        'Falha na Conexão',
                        testResults
                    );
                    return testMessage.edit({ embeds: [errorEmbed] });
                }
            } else {
                testResults += '✅ Já conectado ao canal de voz\n';
            }

            testResults += '\n';

            // Atualizar progresso
            const progressEmbed3 = MusicUtils.createInfoEmbed(
                'Teste de Conexão de Voz - Progresso',
                testResults + '**4️⃣ FASE: REPRODUÇÃO DE ÁUDIO**\n🔄 Iniciando reprodução...'
            );
            await testMessage.edit({ embeds: [progressEmbed3] });

            // Fase 4: Reprodução
            testResults += '**4️⃣ FASE: REPRODUÇÃO DE ÁUDIO**\n';
            
            try {
                queue.addTrack(track);
                testResults += '✅ Música adicionada à fila\n';
                
                if (!queue.isPlaying()) {
                    await queue.node.play();
                    testResults += '✅ Reprodução iniciada\n';
                } else {
                    testResults += '⚠️ Já estava reproduzindo\n';
                }
                
                // Aguardar um pouco para verificar se não há AbortError
                testResults += '⏳ Aguardando 5 segundos para verificar estabilidade...\n';
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                if (queue.isPlaying()) {
                    testResults += '✅ **SUCESSO! Reprodução estável após 5 segundos**\n';
                } else {
                    testResults += '⚠️ Reprodução parou durante o teste\n';
                }
                
            } catch (playError) {
                testResults += `❌ Erro na reprodução: ${playError.message}\n`;
                
                if (playError.code === 'ABORT_ERR') {
                    testResults += '🔍 **AbortError detectado - as correções não resolveram completamente**\n';
                }
            }

            testResults += '\n';

            // Fase 5: Limpeza
            testResults += '**5️⃣ FASE: LIMPEZA**\n';
            
            try {
                if (queue && queue.connection) {
                    queue.delete();
                    testResults += '✅ Fila limpa com sucesso\n';
                }
            } catch (cleanupError) {
                testResults += `⚠️ Erro na limpeza: ${cleanupError.message}\n`;
            }

            // Resumo final
            testResults += '\n**📊 RESUMO DO TESTE:**\n';
            testResults += '• Busca: ✅ Funcionando\n';
            testResults += '• Criação de fila: ✅ Funcionando\n';
            testResults += `• Conexão de voz: ${connected ? '✅' : '❌'} ${connected ? 'Funcionando' : 'Falhando'}\n`;
            testResults += '• Reprodução: ⚠️ Verificar logs para AbortError\n\n';
            
            if (connected) {
                testResults += '🎉 **As correções de conexão estão funcionando!**\n';
                testResults += 'Se ainda houver AbortError, pode ser um problema do Discord ou da rede.';
            } else {
                testResults += '❌ **Ainda há problemas de conexão**\n';
                testResults += 'Verifique permissões do bot e estabilidade da rede.';
            }

            const finalEmbed = MusicUtils.createInfoEmbed(
                'Resultado do Teste de Conexão de Voz',
                testResults
            );

            if (connected) {
                finalEmbed.setColor('#00FF00');
            } else {
                finalEmbed.setColor('#FF0000');
            }

            await testMessage.edit({ embeds: [finalEmbed] });

        } catch (error) {
            console.error('Erro no teste de voz:', error);
            
            testResults += `\n❌ **ERRO CRÍTICO NO TESTE:**\n`;
            testResults += `Mensagem: ${error.message}\n`;
            testResults += `Código: ${error.code || 'N/A'}\n`;
            testResults += `Stack: ${error.stack?.substring(0, 200) || 'N/A'}...\n`;
            
            const errorEmbed = MusicUtils.createErrorEmbed(
                'Erro no Teste de Voz',
                testResults
            );
            
            await testMessage.edit({ embeds: [errorEmbed] });
        }
    }
};
