const { AudioPlayerStatus } = require('@discordjs/voice');
const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'resume',
        aliases: ['continuar', 'unpause'],
        description: 'Retoma a música pausada',
        usage: '!resume'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const player = client.players.get(guildId);
        const queue = client.queues.get(guildId);

        // Verificações
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para usar este comando!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!player || !queue || queue.length === 0) {
            const embed = MusicUtils.createErrorEmbed(
                'Nenhuma Música Tocando',
                'Não há música tocando no momento!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (player.state.status !== AudioPlayerStatus.Paused) {
            const embed = MusicUtils.createInfoEmbed(
                'Não Pausado',
                '▶️ A música não está pausada!\n\nEla já está tocando normalmente.'
            );
            return message.reply({ embeds: [embed] });
        }

        player.unpause();

        const embed = MusicUtils.createSuccessEmbed(
            'Música Retomada',
            `▶️ **${queue[0].title}** foi retomada por ${message.author.toString()}`
        );

        message.reply({ embeds: [embed] });
    }
};
