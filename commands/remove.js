const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'remove',
        aliases: ['remover', 'delete', 'rm'],
        description: 'Remove uma música específica da fila',
        usage: '!remove <posição>'
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

        if (!queue || queue.length <= 1) {
            const embed = MusicUtils.createErrorEmbed(
                'Fila Insuficiente',
                'Não há músicas na fila para remover!\n\n*A música atual não pode ser removida, use `!skip` para pular.*'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Posição Obrigatória',
                'Por favor, especifique a posição da música na fila!\n\n**Exemplo:** `!remove 3`\n\nUse `!queue` para ver as posições.'
            );
            return message.reply({ embeds: [embed] });
        }

        const position = parseInt(args[0]);

        // Validar posição
        if (isNaN(position) || position < 2 || position > queue.length) {
            const embed = MusicUtils.createErrorEmbed(
                'Posição Inválida',
                `Por favor, forneça uma posição válida entre **2** e **${queue.length}**.\n\n*Posição 1 é a música atual (use \`!skip\` para pular).*`
            );
            return message.reply({ embeds: [embed] });
        }

        // Remover música
        const removedSong = queue.splice(position - 1, 1)[0];

        const embed = MusicUtils.createSuccessEmbed(
            'Música Removida',
            `🗑️ **${removedSong.title}** foi removida da fila por ${message.author.toString()}`
        );

        embed.addFields(
            { name: '📍 Posição Removida', value: position.toString(), inline: true },
            { name: '📋 Músicas Restantes', value: (queue.length - 1).toString(), inline: true },
            { name: '👤 Solicitada por', value: removedSong.requester.toString(), inline: true }
        );

        message.reply({ embeds: [embed] });
    }
};
