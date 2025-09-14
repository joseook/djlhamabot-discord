const MusicUtils = require('../utils/musicUtils');
const { Client } = require('genius-lyrics');

module.exports = {
    data: {
        name: 'lyrics',
        aliases: ['letra', 'lyric'],
        description: 'Mostra a letra da música que está tocando ou de uma música específica',
        usage: '!lyrics [nome da música]'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.queues.get(guildId);

        let searchQuery;

        // Se não foi fornecido argumento, usar música atual
        if (!args.length) {
            if (!queue || queue.length === 0) {
                const embed = MusicUtils.createErrorEmbed(
                    'Nenhuma Música Tocando',
                    'Não há músicas tocando no momento!\n\nUse `!lyrics <nome da música>` para buscar uma música específica.'
                );
                return message.reply({ embeds: [embed] });
            }
            
            searchQuery = queue[0].title;
        } else {
            searchQuery = args.join(' ');
        }

        // Verificar se o token do Genius está configurado
        if (!process.env.GENIUS_ACCESS_TOKEN) {
            const embed = MusicUtils.createErrorEmbed(
                'Serviço Indisponível',
                '🔧 O serviço de letras não está configurado.\n\n*O administrador precisa configurar a API do Genius.*'
            );
            return message.reply({ embeds: [embed] });
        }

        const loadingEmbed = MusicUtils.createInfoEmbed(
            'Buscando Letra',
            `🔍 Procurando a letra de: **${searchQuery}**\n\nAguarde um momento...`
        );
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });

        try {
            const genius = new Client(process.env.GENIUS_ACCESS_TOKEN);
            
            // Buscar música
            const searches = await genius.songs.search(searchQuery);
            
            if (!searches.length) {
                const embed = MusicUtils.createErrorEmbed(
                    'Letra Não Encontrada',
                    `❌ Não foi possível encontrar a letra de: **${searchQuery}**\n\nTente usar termos de busca diferentes.`
                );
                return loadingMessage.edit({ embeds: [embed] });
            }

            const song = searches[0];
            
            // Buscar letra
            const lyrics = await song.lyrics();
            
            if (!lyrics) {
                const embed = MusicUtils.createErrorEmbed(
                    'Letra Indisponível',
                    `📝 A letra de **${song.fullTitle}** não está disponível.`
                );
                return loadingMessage.edit({ embeds: [embed] });
            }

            // Dividir letra em chunks se for muito longa
            const maxLength = 4000;
            const lyricsChunks = [];
            
            if (lyrics.length > maxLength) {
                const lines = lyrics.split('\n');
                let currentChunk = '';
                
                for (const line of lines) {
                    if ((currentChunk + line + '\n').length > maxLength) {
                        if (currentChunk) {
                            lyricsChunks.push(currentChunk.trim());
                            currentChunk = line + '\n';
                        } else {
                            // Linha muito longa, cortar
                            lyricsChunks.push(line.substring(0, maxLength - 3) + '...');
                        }
                    } else {
                        currentChunk += line + '\n';
                    }
                }
                
                if (currentChunk) {
                    lyricsChunks.push(currentChunk.trim());
                }
            } else {
                lyricsChunks.push(lyrics);
            }

            // Criar embed principal
            const embed = MusicUtils.createMusicEmbed(
                `🎤 ${song.fullTitle}`,
                lyricsChunks[0]
            );

            if (song.thumbnail) {
                embed.setThumbnail(song.thumbnail);
            }

            embed.addFields(
                { name: '🎨 Artista', value: song.artist.name, inline: true },
                { name: '🔗 Genius', value: `[Ver no Genius](${song.url})`, inline: true }
            );

            if (lyricsChunks.length > 1) {
                embed.setFooter({ text: `Página 1/${lyricsChunks.length} • DJ Lhama • Criado por Joseok` });
            }

            await loadingMessage.edit({ embeds: [embed] });

            // Se há mais páginas, enviar as outras
            if (lyricsChunks.length > 1) {
                for (let i = 1; i < Math.min(lyricsChunks.length, 3); i++) {
                    const pageEmbed = MusicUtils.createMusicEmbed(
                        `🎤 ${song.fullTitle} (Continuação)`,
                        lyricsChunks[i]
                    );
                    
                    pageEmbed.setFooter({ text: `Página ${i + 1}/${lyricsChunks.length} • DJ Lhama • Criado por Joseok` });
                    
                    await message.channel.send({ embeds: [pageEmbed] });
                }

                if (lyricsChunks.length > 3) {
                    const moreEmbed = MusicUtils.createInfoEmbed(
                        'Letra Muito Longa',
                        `📖 Esta letra tem mais páginas. Visite o [Genius](${song.url}) para ver a letra completa.`
                    );
                    await message.channel.send({ embeds: [moreEmbed] });
                }
            }

        } catch (error) {
            console.error('Erro ao buscar letra:', error);
            
            const embed = MusicUtils.createErrorEmbed(
                'Erro na Busca',
                `❌ Ocorreu um erro ao buscar a letra de: **${searchQuery}**\n\nTente novamente mais tarde.`
            );
            
            loadingMessage.edit({ embeds: [embed] });
        }
    }
};
