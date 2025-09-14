const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'shuffle',
        aliases: ['embaralhar', 'mix'],
        description: 'Embaralha a fila de músicas',
        usage: '!shuffle'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.queues.get(guildId);

        // Verificações
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para usar este comando!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!queue || queue.length <= 2) {
            const embed = MusicUtils.createErrorEmbed(
                'Fila Insuficiente',
                'É necessário ter pelo menos 3 músicas na fila para embaralhar!\n\n*A música atual não será afetada.*'
            );
            return message.reply({ embeds: [embed] });
        }

        // Embaralhar apenas as músicas que não estão tocando (índice 1 em diante)
        const currentSong = queue[0]; // Música atual
        const remainingQueue = queue.slice(1); // Resto da fila

        // Algoritmo Fisher-Yates para embaralhar
        for (let i = remainingQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingQueue[i], remainingQueue[j]] = [remainingQueue[j], remainingQueue[i]];
        }

        // Reconstituir a fila com a música atual no início
        const newQueue = [currentSong, ...remainingQueue];
        client.queues.set(guildId, newQueue);

        const embed = MusicUtils.createSuccessEmbed(
            'Fila Embaralhada',
            `🔀 A fila foi embaralhada com sucesso por ${message.author.toString()}!\n\n**${remainingQueue.length}** músicas foram reorganizadas aleatoriamente.`
        );

        embed.addFields({
            name: '🎵 Próximas 3 Músicas',
            value: newQueue.slice(1, 4).map((song, index) => 
                `**${index + 1}.** ${song.title}`
            ).join('\n') || 'Nenhuma música na fila',
            inline: false
        });

        message.reply({ embeds: [embed] });
    }
};
