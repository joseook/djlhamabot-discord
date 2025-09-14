const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'skip',
        aliases: ['s', 'pular', 'next'],
        description: 'Pula para a próxima música na fila',
        usage: '!skip'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const queue = client.queues.get(guildId);
        const player = client.players.get(guildId);

        // Verificações
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para usar este comando!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!queue || queue.length === 0) {
            const embed = MusicUtils.createErrorEmbed(
                'Fila Vazia',
                'Não há músicas tocando no momento!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!player) {
            const embed = MusicUtils.createErrorEmbed(
                'Player Inativo',
                'Não há nenhum player ativo no momento!'
            );
            return message.reply({ embeds: [embed] });
        }

        // Pegar informações da música atual
        const currentSong = queue[0];
        
        // Parar o player (isso vai triggerar o evento 'idle' que toca a próxima)
        player.stop();

        const embed = MusicUtils.createSuccessEmbed(
            'Música Pulada',
            `⏭️ **${currentSong.title}** foi pulada por ${message.author.toString()}`
        );

        if (queue.length > 1) {
            embed.addFields({
                name: 'Próxima música',
                value: `🎵 ${queue[1].title}`,
                inline: false
            });
        } else {
            embed.addFields({
                name: 'Status da Fila',
                value: '📭 Esta era a última música da fila',
                inline: false
            });
        }

        message.reply({ embeds: [embed] });
    }
};
