const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'skipto',
        aliases: ['jumpTo', 'jump', 'pularPara'],
        description: 'Pula para uma música específica na fila',
        usage: '!skipto <posição>'
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

        if (!queue || queue.length <= 1) {
            const embed = MusicUtils.createErrorEmbed(
                'Fila Insuficiente',
                'Não há músicas suficientes na fila para pular!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Posição Obrigatória',
                'Por favor, especifique a posição da música na fila!\n\n**Exemplo:** `!skipto 3`\n\nUse `!queue` para ver as posições.'
            );
            return message.reply({ embeds: [embed] });
        }

        const position = parseInt(args[0]);

        // Validar posição
        if (isNaN(position) || position < 2 || position > queue.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Posição Inválida',
                `Por favor, forneça uma posição válida entre **2** e **${queue.length}**.\n\n*Use \`!skip\` para pular apenas uma música.*`
            );
            return message.reply({ embeds: [embed] });
        }

        // Remover todas as músicas antes da posição desejada
        const skippedSongs = queue.splice(1, position - 2);
        const targetSong = queue[1];

        // Parar o player para triggerar a próxima música
        if (player) {
            player.stop();
        }

        const embed = MusicUtils.createSuccessEmbed(
            'Pulando para Música',
            `⏭️ Pulando **${skippedSongs.length}** música${skippedSongs.length !== 1 ? 's' : ''} para tocar:\n\n🎵 **${targetSong.title}**`
        );

        embed.addFields(
            { name: '📍 Nova Posição', value: '2 (próxima)', inline: true },
            { name: '🗑️ Músicas Puladas', value: skippedSongs.length.toString(), inline: true },
            { name: '👤 Solicitado por', value: message.author.toString(), inline: true }
        );

        message.reply({ embeds: [embed] });
    }
};
