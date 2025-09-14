const { createAudioResource } = require('@discordjs/voice');
const YouTube = require('youtube-sr').default;

/**
 * Sistema de áudio alternativo para DJ Lhama
 * Criado por Joseok - Sem dependência do ytdl-core
 */

class AudioUtils {
    
    /**
     * Busca música no YouTube (apenas metadados)
     */
    static async searchYouTube(query) {
        try {
            const results = await YouTube.search(query, { limit: 1, type: 'video' });
            return results[0] || null;
        } catch (error) {
            console.error('Erro ao buscar no YouTube:', error);
            return null;
        }
    }

    /**
     * Cria um recurso de áudio usando URL alternativa
     * NOTA: Esta é uma implementação temporária até que o ytdl-core seja corrigido
     */
    static async createAudioResource(song) {
        // Por enquanto, retornamos um erro informativo
        // Em uma implementação real, usaríamos:
        // - Lavalink
        // - APIs pagas como Spotify/Apple Music
        // - Serviços de streaming alternativos
        // - Arquivos de áudio locais
        
        throw new Error('YOUTUBE_UNAVAILABLE');
    }

    /**
     * Verifica se uma URL é do YouTube
     */
    static isYouTubeURL(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    /**
     * Extrai ID do vídeo do YouTube
     */
    static extractVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Formata duração em segundos para MM:SS
     */
    static formatDuration(duration) {
        if (!duration) return 'Desconhecido';
        
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Cria um recurso de áudio de demonstração (para testes)
     */
    static createDemoAudioResource() {
        // Retorna um recurso de áudio silencioso para demonstração
        // Em produção, isso seria substituído por uma fonte real
        const silence = Buffer.alloc(1024, 0);
        return createAudioResource(silence);
    }
}

module.exports = AudioUtils;
