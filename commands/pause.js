const { AudioPlayerStatus } = require('@discordjs/voice');
const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'pause',
        aliases: ['pausar'],
        description: 'Pausa a música atual',
        usage: '!pause'
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

        if (player.state.status === AudioPlayerStatus.Paused) {
            const embed = MusicUtils.createInfoEmbed(
                'Já Pausado',
                '⏸️ A música já está pausada!\n\nUse `!resume` para continuar.'
            );
            return message.reply({ embeds: [embed] });
        }

        player.pause();

        const embed = MusicUtils.createSuccessEmbed(
            'Música Pausada',
            `⏸️ **${queue[0].title}** foi pausada por ${message.author.toString()}\n\nUse \`!resume\` para continuar tocando.`
        );

        message.reply({ embeds: [embed] });
    }
};
