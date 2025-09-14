const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'queue',
        aliases: ['q', 'fila', 'list'],
        description: 'Mostra a fila atual de músicas',
        usage: '!queue [página]'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.queues.get(guildId);

        if (!queue || queue.length === 0) {
            const embed = MusicUtils.createInfoEmbed(
                'Fila Vazia',
                '📭 Não há músicas na fila no momento.\n\nUse `!play <música>` para adicionar músicas!'
            );
            return message.reply({ embeds: [embed] });
        }

        // Paginação
        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 10;
        
        const embed = MusicUtils.createQueueEmbed(queue, page, itemsPerPage);
        
        // Adicionar informação da música atual
        if (queue.length > 0) {
            const currentSong = queue[0];
            embed.addFields({
                name: '🎵 Tocando Agora',
                value: `[${currentSong.title}](${currentSong.url})\n👤 Solicitado por: ${currentSong.requester.toString()}`,
                inline: false
            });
        }

        message.reply({ embeds: [embed] });
    }
};
