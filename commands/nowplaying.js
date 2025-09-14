const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'nowplaying',
        aliases: ['np', 'current', 'tocando'],
        description: 'Mostra informações sobre a música que está tocando',
        usage: '!nowplaying'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.queues.get(guildId);
        const player = client.players.get(guildId);

        // Verificações
        if (!queue || queue.length === 0) {
            const embed = MusicUtils.createInfoEmbed(
                'Nenhuma Música Tocando',
                '📭 Não há músicas tocando no momento.\n\nUse `!play <música>` para começar a tocar!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!player) {
            const embed = MusicUtils.createErrorEmbed(
                'Player Inativo',
                'O player não está ativo no momento!'
            );
            return message.reply({ embeds: [embed] });
        }

        const currentSong = queue[0];
        const embed = MusicUtils.createNowPlayingEmbed(currentSong, currentSong.requester);

        // Adicionar informações extras
        embed.addFields(
            { name: '📊 Status do Player', value: player.state.status, inline: true },
            { name: '📋 Músicas na Fila', value: (queue.length - 1).toString(), inline: true }
        );

        // Mostrar próxima música se houver
        if (queue.length > 1) {
            embed.addFields({
                name: '⏭️ Próxima Música',
                value: `[${queue[1].title}](${queue[1].url})`,
                inline: false
            });
        }

        message.reply({ embeds: [embed] });
    }
};
