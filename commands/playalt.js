const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'playalt',
        aliases: ['pa', 'playsearch', 'ps'],
        description: 'Toca música usando apenas busca (alternativa ao !play para contornar bloqueios)',
        usage: '!playalt <nome da música>'
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
                'Por favor, forneça o nome da música!\n\n**Exemplo:** `!playalt Never Gonna Give You Up`\n\n*Este comando usa apenas busca, sem links diretos*'
            );
            return message.reply({ embeds: [embed] });
        }

        const query = args.join(' ');
        const guildId = message.guild.id;
        const voiceChannel = message.member.voice.channel;

        try {
            // Sempre usar busca (nunca links diretos)
            const searchResult = await MusicUtils.searchYouTube(query);
            if (!searchResult) {
                const embed = MusicUtils.createErrorEmbed(
                    'Música Não Encontrada',
                    `Não foi possível encontrar: **${query}**\n\nTente usar termos de busca diferentes.`
                );
                return message.reply({ embeds: [embed] });
            }

            const song = {
                title: searchResult.title,
                url: searchResult.url,
                duration: searchResult.duration,
                thumbnail: searchResult.thumbnail?.url,
                channel: searchResult.channel?.name,
                requester: message.author
            };

            // Inicializar fila se não existir
            if (!client.queues.has(guildId)) {
                client.queues.set(guildId, []);
            }

            const queue = client.queues.get(guildId);

            // Verificar limite da fila
            if (queue.length >= client.config.maxQueueSize) {
                const embed = MusicUtils.createErrorEmbed(
                    'Fila Cheia',
                    `A fila atingiu o limite máximo de ${client.config.maxQueueSize} músicas!`
                );
                return message.reply({ embeds: [embed] });
            }

            // Adicionar à fila
            queue.push(song);

            // Se não há conexão de voz, criar uma
            if (!client.connections.has(guildId)) {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guildId,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                client.connections.set(guildId, connection);

                // Criar player se não existir
                if (!client.players.has(guildId)) {
                    const player = createAudioPlayer();
                    client.players.set(guildId, player);
                    connection.subscribe(player);

                    // Event listeners do player
                    player.on(AudioPlayerStatus.Idle, () => {
                        this.playNext(client, guildId, message);
                    });

                    player.on('error', error => {
                        console.error('Erro no player:', error);
                        this.playNext(client, guildId, message);
                    });
                }
            }

            // Se é a primeira música, começar a tocar
            if (queue.length === 1) {
                this.playSong(client, guildId, message);
            } else {
                // Música adicionada à fila
                const embed = MusicUtils.createSuccessEmbed(
                    'Música Adicionada à Fila (Modo Alternativo)',
                    `[${song.title}](${song.url})\n\n**Posição na fila:** ${queue.length}\n\n*🔄 Usando método de busca para evitar bloqueios*`
                );
                
                if (song.thumbnail) {
                    embed.setThumbnail(song.thumbnail);
                }

                embed.addFields(
                    { name: '🎤 Canal', value: song.channel || 'Desconhecido', inline: true },
                    { name: '⏱️ Duração', value: song.duration ? MusicUtils.formatDuration(song.duration) : 'Desconhecido', inline: true },
                    { name: '👤 Solicitado por', value: message.author.toString(), inline: true }
                );

                message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro no comando playalt:', error);
            const embed = MusicUtils.createErrorEmbed(
                'Erro na Busca',
                'Houve um erro ao buscar esta música. Tente novamente com termos diferentes.'
            );
            message.reply({ embeds: [embed] });
        }
    },

    async playSong(client, guildId, message) {
        const queue = client.queues.get(guildId);
        const player = client.players.get(guildId);

        if (!queue || queue.length === 0) {
            return;
        }

        const song = queue[0];

        try {
            const resource = await MusicUtils.createAudioResourceFromYT(song.url);
            player.play(resource);

            // Mostrar "Tocando Agora"
            const embed = MusicUtils.createNowPlayingEmbed(song, song.requester);
            embed.setFooter({ text: 'DJ Lhama • Modo Alternativo • Criado por Joseok' });
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao tocar música (modo alternativo):', error);
            
            // Remover música com erro e tentar a próxima
            queue.shift();
            
            const embed = MusicUtils.createErrorEmbed(
                'Erro na Reprodução',
                `Não foi possível reproduzir: **${song.title}**\n\nTentando próxima música...`
            );
            message.channel.send({ embeds: [embed] });

            this.playNext(client, guildId, message);
        }
    },

    async playNext(client, guildId, message) {
        const queue = client.queues.get(guildId);

        if (!queue || queue.length === 0) {
            return;
        }

        // Remove a música atual
        queue.shift();

        if (queue.length > 0) {
            // Toca a próxima música
            setTimeout(() => {
                this.playSong(client, guildId, message);
            }, 1000);
        } else {
            // Fila vazia - desconectar após timeout
            setTimeout(() => {
                const connection = client.connections.get(guildId);
                if (connection && queue.length === 0) {
                    connection.destroy();
                    client.connections.delete(guildId);
                    client.players.delete(guildId);
                    client.queues.delete(guildId);

                    const embed = MusicUtils.createInfoEmbed(
                        'Sessão Finalizada',
                        '🦙 DJ Lhama saiu do canal por inatividade.\n\n*Criado por Joseok*'
                    );
                    message.channel.send({ embeds: [embed] });
                }
            }, client.config.disconnectTimeout);
        }
    }
};
