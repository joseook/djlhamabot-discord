const { EmbedBuilder } = require('discord.js');
const YouTube = require('youtube-sr').default;

// Tentar importar Discord Player com fallback
let Player = null;
try {
    const discordPlayer = require('discord-player');
    Player = discordPlayer.Player;
    console.log('✅ Discord Player importado com sucesso');
} catch (error) {
    console.warn('⚠️ Discord Player não disponível:', error.message);
}

/**
 * Sistema Híbrido de Música para DJ Lhama
 * Criado por Joseok
 * 
 * Usa Discord Player como método principal e ytdl-core como fallback
 */

class HybridMusicUtils {
    constructor(client) {
        this.client = client;
        this.player = null;
        this.initializePlayer();
    }

    /**
     * Inicializa o Discord Player com configurações otimizadas
     */
    initializePlayer() {
        if (!Player) {
            console.warn('⚠️ Discord Player não disponível - usando apenas fallbacks');
            this.player = null;
            return;
        }

        try {
            this.player = new Player(this.client, {
                // Configurações otimizadas para performance e estabilidade
                ytdlOptions: {
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25,
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    },
                    // Configurações para evitar AbortError
                    filter: 'audioonly',
                    fmt: 'mp4',
                    begin: 0
                },
                // Timeouts otimizados
                connectionTimeout: 20000, // Reduzido para evitar timeouts longos
                searchTimeout: 8000, // Reduzido para busca mais rápida
                playTimeout: 10000, // Reduzido para início mais rápido
                
                // Configurações de retry mais agressivas
                retryOnError: true,
                retryCount: 2, // Reduzido para evitar loops longos
                retryDelay: 1500, // Reduzido para retry mais rápido
                
                // Configurações de buffer otimizadas
                bufferingTimeout: 2000, // Reduzido para menos delay
                maxSize: 50, // Reduzido para menos memória
                maxHistorySize: 25, // Reduzido para menos memória
                
                // Configurações de áudio otimizadas
                disableVolume: false,
                smoothVolume: true,
                
                // Configurações para evitar AbortError
                skipFFmpeg: false,
                useLegacyFFmpeg: false
            });

            // Event listeners otimizados
            this.player.events.on('error', (queue, error) => {
                console.error('❌ Erro geral do player:', {
                    message: error.message,
                    code: error.code,
                    name: error.name
                });
                
                // Tratamento específico para AbortError
                if (error.code === 'ABORT_ERR' || error.message.includes('aborted')) {
                    console.log('🔄 Detectado AbortError - tentando solução...');
                    this.handleAbortError(queue);
                    console.log('🔄 Tentando reconectar devido a AbortError...');
                    setTimeout(async () => {
                        try {
                            if (queue.connection && !queue.connection.destroyed) {
                                await queue.connect(queue.metadata.voiceChannel);
                                console.log('✅ Reconexão bem-sucedida');
                            }
                        } catch (reconnectError) {
                            console.error('❌ Falha na reconexão:', reconnectError.message);
                        }
                    }, 2000);
                }
            });

            this.player.events.on('connectionError', (queue, error) => {
                console.error('❌ Erro de conexão:', error.message);
            });

            this.player.events.on('playerError', (queue, error) => {
                console.error('❌ Erro do player:', error.message);
            });

            console.log('✅ Discord Player inicializado com configurações otimizadas');
            
            // Carregar extractors de forma assíncrona e otimizada
            this.loadExtractorsOptimized();
        } catch (error) {
            console.error('❌ Erro ao inicializar Discord Player:', error);
            this.player = null;
        }
    }

    /**
     * Carrega extractors de forma otimizada
     */
    async loadExtractorsOptimized() {
        if (!this.player) return;
        
        try {
            console.log('📦 Carregando extractors otimizados...');
            await this.player.extractors.loadDefault((ext) => {
                // Carregar apenas extractors essenciais para melhor performance
                return ['YoutubeExtractor', 'SpotifyExtractor', 'SoundCloudExtractor'].includes(ext);
            });
            
            const loadedExtractors = this.player.extractors.store.map(ext => ext.identifier);
            console.log('✅ Extractors carregados:', loadedExtractors.join(', '));
        } catch (error) {
            console.warn('⚠️ Erro ao carregar extractors:', error.message);
        }
    }

    /**
     * Trata especificamente o AbortError
     */
    async handleAbortError(queue) {
        if (!queue) return;
        
        try {
            console.log('🔧 Tratando AbortError...');
            
            // Parar qualquer reprodução atual
            if (queue.node.isPlaying()) {
                queue.node.stop();
            }
            
            // Aguardar um pouco antes de tentar reconectar
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Tentar reconectar se ainda temos o canal de voz
            if (queue.metadata?.voiceChannel) {
                await this.attemptReconnect(queue);
                
                // Tentar reproduzir novamente se temos tracks na fila
                if (queue.tracks.size > 0) {
                    console.log('🔄 Tentando reproduzir novamente após AbortError...');
                    setTimeout(() => {
                        queue.node.play().catch(err => {
                            console.error('❌ Falha ao reproduzir após AbortError:', err.message);
                        });
                    }, 2000);
                }
            }
            
            console.log('✅ Tratamento de AbortError concluído');
        } catch (error) {
            console.error('❌ Erro ao tratar AbortError:', error.message);
        }
    }

    /**
     * Tenta reconectar ao canal de voz
     */
    async attemptReconnect(queue) {
        if (!queue || !queue.metadata?.voiceChannel) return false;
        
        try {
            console.log('🔄 Tentando reconectar ao canal de voz...');
            
            // Desconectar primeiro se já conectado
            if (queue.connection) {
                queue.connection.destroy();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Reconectar com configurações otimizadas
            await queue.connect(queue.metadata.voiceChannel, {
                deaf: true,
                maxTime: 15000, // Timeout reduzido
            });
            
            console.log('✅ Reconexão bem-sucedida');
            return true;
        } catch (error) {
            console.error('❌ Falha na reconexão:', error.message);
            return false;
        }
    }

    /**
     * Tenta reproduzir música usando Discord Player primeiro, depois ytdl-core
     */
    async playMusic(message, query) {
        const voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel) {
            return this.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para usar este comando!'
            );
        }

        try {
            // Método 1: Tentar Discord Player primeiro
            if (this.player) {
                console.log('🎵 Tentando reproduzir com Discord Player...');
                const result = await this.tryDiscordPlayer(message, query, voiceChannel);
                if (result.success) {
                    return result.embed;
                }
                console.log('⚠️ Discord Player falhou, tentando método alternativo...');
            }

            // Método 2: Fallback com reprodução real de áudio
            console.log('🔄 Tentando método de busca alternativo...');
            const fallbackResult = await this.trySearchFallback(query, message, voiceChannel);
            if (fallbackResult.success) {
                return fallbackResult.embed;
            }

            // Método 3: Se tudo falhar, mostrar erro informativo
            return this.createErrorEmbed(
                'Serviços de Música Temporariamente Indisponíveis',
                `❌ **Todos os métodos de reprodução falharam**\n\n**Tentativas realizadas:**\n• Discord Player: Falhou\n• Busca alternativa: Falhou\n• YouTube: Temporariamente indisponível\n\n**Soluções:**\n• Tente novamente em alguns minutos\n• Use \`!musicstatus\` para mais informações\n• O problema é temporário e será resolvido\n\n*Este é um problema conhecido do YouTube que afeta todos os bots de música*`
            );

        } catch (error) {
            console.error('❌ Erro geral no sistema híbrido:', error);
            return this.createErrorEmbed(
                'Erro no Sistema de Música',
                `Houve um erro inesperado no sistema de música.\n\n**Erro:** ${error.message}\n\nTente novamente ou use \`!musicstatus\` para mais informações.`
            );
        }
    }

    /**
     * Tenta reproduzir usando Discord Player (otimizado para performance)
     */
    async tryDiscordPlayer(message, query, voiceChannel) {
        if (!this.player) {
            console.log('⚠️ Discord Player não inicializado');
            return { success: false, error: 'Discord Player não inicializado' };
        }

        const startTime = Date.now();
        console.log(`🔍 Busca otimizada no Discord Player: ${query}`);

        try {
            // Busca otimizada - tentar apenas YouTube primeiro (mais rápido)
            let searchResult = null;
            
            try {
                console.log('🔎 Busca rápida via YouTube...');
                searchResult = await Promise.race([
                    this.player.search(query, {
                        requestedBy: message.author,
                        searchEngine: 'youtube'
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout na busca')), 6000)
                    )
                ]);
                
                if (searchResult?.tracks?.length > 0) {
                    console.log(`✅ Busca rápida: ${searchResult.tracks.length} resultados (${Date.now() - startTime}ms)`);
                } else {
                    throw new Error('Sem resultados na busca rápida');
                }
            } catch (quickError) {
                console.log(`⚠️ Busca rápida falhou, tentando busca completa...`);
                
                // Fallback para busca mais completa apenas se necessário
                const searchMethods = ['auto', 'soundcloud'];
                
                for (const engine of searchMethods) {
                    try {
                        searchResult = await Promise.race([
                            this.player.search(query, {
                                requestedBy: message.author,
                                searchEngine: engine
                            }),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 4000)
                            )
                        ]);
                        
                        if (searchResult?.tracks?.length > 0) {
                            console.log(`✅ Sucesso com ${engine}: ${searchResult.tracks.length} resultados`);
                            break;
                        }
                    } catch (methodError) {
                        console.warn(`❌ ${engine} falhou:`, methodError.message);
                    }
                }
            }

            if (!searchResult?.tracks?.length) {
                return { success: false, error: 'Nenhuma música encontrada' };
            }

            // Criar fila com configurações otimizadas para evitar AbortError
            const queue = this.player.nodes.create(message.guild, {
                metadata: {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel
                },
                selfDeaf: true,
                volume: this.client.config?.defaultVolume || 50,
                
                // Configurações otimizadas para estabilidade
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 180000, // 3 minutos
                leaveOnEnd: false, // Não sair automaticamente
                
                // Configurações anti-AbortError
                connectionTimeout: 15000, // Timeout reduzido
                maxSize: 25, // Fila menor para melhor performance
                maxHistorySize: 10,
                bufferingTimeout: 1500, // Buffer mais rápido
                disableVolume: false,
                
                // Configurações de áudio otimizadas
                noEmitAddTrackOnRepeat: true,
                skipOnNoStream: true
            });

            // Conexão otimizada
            if (!queue.connection) {
                console.log('🔗 Conectando (modo otimizado)...');
                
                try {
                    await Promise.race([
                        queue.connect(voiceChannel, {
                            deaf: true,
                            maxTime: 12000 // Timeout mais agressivo
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout de conexão')), 15000)
                        )
                    ]);
                    console.log('✅ Conectado rapidamente');
                } catch (connectError) {
                    // Retry uma única vez com configurações diferentes
                    console.log('🔄 Retry de conexão...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    await queue.connect(voiceChannel, {
                        deaf: true,
                        maxTime: 8000
                    });
                    console.log('✅ Conectado no retry');
                }
            }

            const track = searchResult.tracks[0];
            console.log(`➕ Adicionando: ${track.title}`);
            queue.addTrack(track);

            // Iniciar reprodução com tratamento de AbortError
            if (!queue.isPlaying()) {
                console.log('▶️ Iniciando reprodução otimizada...');
                
                try {
                    await Promise.race([
                        queue.node.play(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout de reprodução')), 8000)
                        )
                    ]);
                } catch (playError) {
                    if (playError.code === 'ABORT_ERR' || playError.message.includes('aborted')) {
                        console.log('⚠️ AbortError detectado, aplicando solução...');
                        await this.handleAbortError(queue);
                    } else {
                        throw playError;
                    }
                }
            }

            const totalTime = Date.now() - startTime;
            console.log(`✅ Processo completo em ${totalTime}ms`);

            const embed = this.createSuccessEmbed(
                'Música Adicionada (Sistema Otimizado)',
                `🎵 **[${track.title}](${track.url})**\n\n**Canal:** ${track.author}\n**Duração:** ${track.duration}\n**Processado em:** ${totalTime}ms\n**Solicitado por:** ${message.author.toString()}\n\n⚡ *Sistema híbrido otimizado*`
            );

            if (track.thumbnail) {
                embed.setThumbnail(track.thumbnail);
            }

            return { success: true, embed };

        } catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ Erro após ${totalTime}ms:`, {
                message: error.message,
                code: error.code,
                name: error.name
            });
            
            // Tratamento específico para AbortError
            if (error.code === 'ABORT_ERR' || error.message.includes('aborted')) {
                return { 
                    success: false, 
                    error: 'AbortError detectado - tente novamente em alguns segundos',
                    isAbortError: true
                };
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Sistema de fallback com reprodução real de áudio
     */
    async trySearchFallback(query, message, voiceChannel) {
        console.log(`🔍 Tentando sistema de fallback com reprodução: ${query}`);
        
        let songInfo = null;
        
        // Método 1: Busca do YouTube
        try {
            console.log('📺 Tentando busca no YouTube...');
            const searchResult = await YouTube.search(query, { 
                limit: 3, 
                type: 'video',
                safeSearch: false 
            });
            
            console.log(`📊 YouTube encontrou: ${searchResult.length} resultados`);
            
            if (searchResult.length > 0) {
                const bestResult = searchResult[0];
                songInfo = {
                    title: bestResult.title,
                    url: bestResult.url,
                    duration: bestResult.duration,
                    thumbnail: bestResult.thumbnail?.url,
                    channel: bestResult.channel?.name,
                    method: 'YouTube Search'
                };

                console.log(`✅ Música encontrada via YouTube: ${songInfo.title}`);
            }
        } catch (youtubeError) {
            console.error('❌ Erro na busca do YouTube:', youtubeError.message);
        }

        // Método 2: Análise de URL direta
        if (!songInfo && this.isYouTubeURL(query)) {
            try {
                console.log('🔗 Tentando análise de URL direta...');
                const urlInfo = await this.extractYouTubeInfo(query);
                if (urlInfo) {
                    songInfo = {
                        ...urlInfo,
                        method: urlInfo.method || 'URL Analysis'
                    };
                    console.log(`✅ URL analisada: ${songInfo.title || 'Título não disponível'}`);
                }
            } catch (urlError) {
                console.error('❌ Erro na análise de URL:', urlError.message);
            }
        }

        // Método 3: Busca simplificada
        if (!songInfo) {
            try {
                console.log('🔍 Tentando busca simplificada...');
                const cleanQuery = this.cleanSearchQuery(query);
                const simpleSearch = await YouTube.search(cleanQuery, { 
                    limit: 1, 
                    type: 'video'
                });
                
                if (simpleSearch.length > 0) {
                    const result = simpleSearch[0];
                    songInfo = {
                        title: result.title,
                        url: result.url,
                        duration: result.duration,
                        thumbnail: result.thumbnail?.url,
                        channel: result.channel?.name,
                        method: 'Simple Search'
                    };
                    console.log(`✅ Busca simplificada encontrou: ${result.title}`);
                }
            } catch (simpleError) {
                console.error('❌ Erro na busca simplificada:', simpleError.message);
            }
        }

        if (!songInfo) {
            console.log('❌ Todos os métodos de fallback falharam');
            return { success: false, error: 'Todos os métodos de busca falharam' };
        }

        // Agora reproduzir o áudio usando ytdl-core + @discordjs/voice
        try {
            console.log('🎵 Iniciando reprodução com sistema de fallback...');
            const audioResult = await this.playWithFallbackAudio(songInfo, voiceChannel, message);
            
            if (audioResult.success) {
                const embed = this.createSuccessEmbed(
                    'Música Adicionada (Sistema Fallback)',
                    `🎵 **[${songInfo.title}](${songInfo.url})**\n\n**Canal:** ${songInfo.channel || 'Desconhecido'}\n**Duração:** ${this.formatDuration(songInfo.duration)}\n**Método:** ${songInfo.method}\n**Solicitado por:** ${message.author.toString()}\n\n🔄 *Sistema de fallback ativo*`
                );

                if (songInfo.thumbnail) {
                    embed.setThumbnail(songInfo.thumbnail);
                }

                return { success: true, embed };
            } else {
                return { success: false, error: audioResult.error };
            }
        } catch (playError) {
            console.error('❌ Erro na reprodução de fallback:', playError.message);
            return { success: false, error: `Falha na reprodução: ${playError.message}` };
        }
    }

    /**
     * Reproduz áudio usando sistema de fallback (ytdl-core + @discordjs/voice)
     */
    async playWithFallbackAudio(songInfo, voiceChannel, message) {
        try {
            const { 
                joinVoiceChannel, 
                createAudioPlayer, 
                createAudioResource, 
                AudioPlayerStatus,
                VoiceConnectionStatus,
                entersState
            } = require('@discordjs/voice');
            
            const ytdl = require('@distube/ytdl-core');
            
            console.log('🔗 Conectando ao canal de voz para fallback...');
            
            // Conectar ao canal de voz
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            // Aguardar conexão estar pronta
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 15000);
                console.log('✅ Conexão de voz estabelecida para fallback');
            } catch (connectionError) {
                console.error('❌ Timeout na conexão de voz:', connectionError.message);
                connection.destroy();
                return { success: false, error: 'Timeout na conexão de voz' };
            }

            // Criar player de áudio
            const player = createAudioPlayer();
            
            // Configurar eventos do player
            player.on(AudioPlayerStatus.Playing, () => {
                console.log('▶️ Reprodução iniciada com sistema de fallback');
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('⏸️ Reprodução finalizada');
                connection.destroy();
            });

            player.on('error', (error) => {
                console.error('❌ Erro no player de fallback:', error.message);
                connection.destroy();
            });

            // Obter stream de áudio
            console.log('🎵 Obtendo stream de áudio...');
            
            let audioStream;
            try {
                // Tentar com ytdl-core primeiro
                audioStream = ytdl(songInfo.url, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25,
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    }
                });
                
                console.log('✅ Stream de áudio obtido com sucesso');
            } catch (streamError) {
                console.error('❌ Erro ao obter stream:', streamError.message);
                connection.destroy();
                return { success: false, error: `Erro no stream de áudio: ${streamError.message}` };
            }

            // Criar recurso de áudio
            const resource = createAudioResource(audioStream, {
                inputType: 'arbitrary',
                inlineVolume: true
            });

            // Definir volume padrão
            if (resource.volume) {
                resource.volume.setVolume(0.5); // 50% de volume
            }

            // Conectar player à conexão
            connection.subscribe(player);

            // Iniciar reprodução
            player.play(resource);

            // Aguardar início da reprodução
            try {
                await entersState(player, AudioPlayerStatus.Playing, 10000);
                console.log('✅ Reprodução iniciada com sucesso');
                
                // Armazenar referências para controle posterior
                if (!this.client.connections) this.client.connections = new Map();
                if (!this.client.players) this.client.players = new Map();
                
                this.client.connections.set(message.guild.id, connection);
                this.client.players.set(message.guild.id, player);
                
                return { success: true };
            } catch (playError) {
                console.error('❌ Erro ao iniciar reprodução:', playError.message);
                connection.destroy();
                return { success: false, error: `Erro ao iniciar reprodução: ${playError.message}` };
            }

        } catch (error) {
            console.error('❌ Erro geral no sistema de fallback:', error.message);
            return { success: false, error: `Erro no sistema de fallback: ${error.message}` };
        }
    }

    /**
     * Verifica se é uma URL do YouTube
     */
    isYouTubeURL(url) {
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
    }

    /**
     * Extrai informações completas de uma URL do YouTube
     */
    async extractYouTubeInfo(url) {
        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) return null;

            console.log(`🔍 Extraindo metadados para vídeo: ${videoId}`);

            // Método 1: Tentar buscar por ID no YouTube Search
            try {
                const searchById = await YouTube.search(videoId, { limit: 1, type: 'video' });
                if (searchById.length > 0) {
                    const video = searchById[0];
                    console.log(`✅ Metadados encontrados via busca por ID: ${video.title}`);
                    return {
                        title: video.title,
                        url: video.url,
                        duration: video.duration,
                        thumbnail: video.thumbnail?.url,
                        channel: video.channel?.name,
                        method: 'Search by ID'
                    };
                }
            } catch (searchError) {
                console.warn('⚠️ Busca por ID falhou:', searchError.message);
            }

            // Método 2: Usar API do YouTube (se disponível)
            if (process.env.YOUTUBE_API_KEY) {
                try {
                    const apiInfo = await this.getYouTubeAPIInfo(videoId);
                    if (apiInfo) {
                        console.log(`✅ Metadados encontrados via API: ${apiInfo.title}`);
                        return apiInfo;
                    }
                } catch (apiError) {
                    console.warn('⚠️ API do YouTube falhou:', apiError.message);
                }
            }

            // Método 3: Fallback básico com informações limitadas
            console.log('📝 Usando informações básicas como fallback');
            return {
                title: `Vídeo do YouTube (${videoId})`,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                duration: 'Desconhecido',
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                channel: 'YouTube',
                method: 'Basic Fallback'
            };

        } catch (error) {
            console.error('❌ Erro ao extrair info da URL:', error);
            return null;
        }
    }

    /**
     * Obtém informações usando a API do YouTube
     */
    async getYouTubeAPIInfo(videoId) {
        if (!process.env.YOUTUBE_API_KEY) {
            return null;
        }

        try {
            const fetch = require('node-fetch');
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const snippet = video.snippet;
                const contentDetails = video.contentDetails;

                return {
                    title: snippet.title,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    duration: this.parseYouTubeDuration(contentDetails.duration),
                    thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url,
                    channel: snippet.channelTitle,
                    method: 'YouTube API'
                };
            }
        } catch (error) {
            console.error('❌ Erro na API do YouTube:', error);
        }

        return null;
    }

    /**
     * Converte duração do formato ISO 8601 (PT4M13S) para formato legível
     */
    parseYouTubeDuration(duration) {
        if (!duration) return 'Desconhecido';
        
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return 'Desconhecido';

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Extrai o ID do vídeo de uma URL do YouTube
     */
    extractVideoId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Limpa a query de busca removendo caracteres especiais
     */
    cleanSearchQuery(query) {
        // Se for URL, extrair apenas o ID ou título
        if (this.isYouTubeURL(query)) {
            const videoId = this.extractVideoId(query);
            return videoId || query;
        }
        
        // Remover caracteres especiais e URLs
        return query
            .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
            .replace(/[^a-zA-Z0-9\s]/g, ' ') // Remove caracteres especiais
            .replace(/\s+/g, ' ') // Remove espaços extras
            .trim();
    }

    /**
     * Utilitários para embeds
     */
    createSuccessEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setFooter({ text: 'DJ Lhama • Sistema Híbrido • Criado por Joseok' })
            .setTimestamp();
    }

    createErrorEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setFooter({ text: 'DJ Lhama • Sistema Híbrido • Criado por Joseok' })
            .setTimestamp();
    }

    createInfoEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setFooter({ text: 'DJ Lhama • Sistema Híbrido • Criado por Joseok' })
            .setTimestamp();
    }

    /**
     * Formata duração
     */
    formatDuration(duration) {
        if (!duration) return 'Desconhecido';
        
        if (typeof duration === 'string') return duration;
        
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Verifica se o Discord Player está disponível
     */
    isDiscordPlayerAvailable() {
        return this.player !== null;
    }

    /**
     * Obtém informações sobre o sistema atual
     */
    getSystemStatus() {
        return {
            discordPlayer: this.player !== null,
            ytdlCore: true, // Sempre disponível para busca
            hybrid: true
        };
    }
}

module.exports = HybridMusicUtils;
