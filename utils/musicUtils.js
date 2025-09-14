const { EmbedBuilder } = require('discord.js');
const { createAudioResource, demuxProbe } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const YouTube = require('youtube-sr').default;

/**
 * Utilitários para o DJ Lhama Bot
 * Criado por Joseok
 */

class MusicUtils {
    static createEmbed(color = '#FF6B6B', title, description, footer = 'DJ Lhama • Criado por Joseok') {
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setFooter({ text: footer })
            .setTimestamp();
    }

    static createSuccessEmbed(title, description) {
        return this.createEmbed('#00FF00', `✅ ${title}`, description);
    }

    static createErrorEmbed(title, description) {
        return this.createEmbed('#FF0000', `❌ ${title}`, description);
    }

    static createInfoEmbed(title, description) {
        return this.createEmbed('#3498DB', `ℹ️ ${title}`, description);
    }

    static createMusicEmbed(title, description) {
        return this.createEmbed('#9B59B6', `🎵 ${title}`, description);
    }

    static formatDuration(duration) {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    static async searchYouTube(query) {
        try {
            const results = await YouTube.search(query, { limit: 1, type: 'video' });
            return results[0] || null;
        } catch (error) {
            console.error('Erro ao buscar no YouTube:', error);
            return null;
        }
    }

    static async createAudioResourceFromYT(url) {
        try {
            // Configurações para contornar bloqueios do YouTube
            const options = {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                }
            };

            const stream = ytdl(url, options);
            const { stream: convertedStream, type } = await demuxProbe(stream);
            return createAudioResource(convertedStream, { inputType: type });
        } catch (error) {
            console.error('Erro ao criar recurso de áudio:', error);
            throw error;
        }
    }

    static isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    static isYouTubeURL(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    static extractVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    static createQueueEmbed(queue, currentPage = 1, itemsPerPage = 10) {
        if (!queue || queue.length === 0) {
            return this.createInfoEmbed('Fila Vazia', 'Não há músicas na fila no momento.');
        }

        const totalPages = Math.ceil(queue.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageQueue = queue.slice(start, end);

        let description = '';
        pageQueue.forEach((song, index) => {
            const position = start + index + 1;
            const duration = song.duration ? this.formatDuration(song.duration) : 'Desconhecido';
            description += `**${position}.** [${song.title}](${song.url}) - \`${duration}\`\n`;
        });

        const embed = this.createMusicEmbed(
            `Fila de Músicas (${queue.length} música${queue.length !== 1 ? 's' : ''})`,
            description
        );

        embed.addFields(
            { name: 'Página', value: `${currentPage}/${totalPages}`, inline: true },
            { name: 'Total de Músicas', value: queue.length.toString(), inline: true }
        );

        return embed;
    }

    static createNowPlayingEmbed(song, requester) {
        const embed = this.createMusicEmbed('Tocando Agora', `[${song.title}](${song.url})`);
        
        if (song.thumbnail) {
            embed.setThumbnail(song.thumbnail);
        }

        embed.addFields(
            { name: '🎤 Canal', value: song.channel || 'Desconhecido', inline: true },
            { name: '⏱️ Duração', value: song.duration ? this.formatDuration(song.duration) : 'Desconhecido', inline: true },
            { name: '👤 Solicitado por', value: requester.toString(), inline: true }
        );

        return embed;
    }
}

module.exports = MusicUtils;
