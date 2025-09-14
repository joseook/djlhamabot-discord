const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'clearqueue',
        aliases: ['clear', 'limpar', 'cq'],
        description: 'Limpa toda a fila de músicas (apenas administradores)',
        usage: '!clearqueue'
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

        // Verificar permissões (administrador ou dono do bot)
        const isAdmin = message.member.permissions.has('Administrator');
        const isOwner = message.author.id === client.config.ownerId;
        
        if (!isAdmin && !isOwner) {
            const embed = MusicUtils.createErrorEmbed(
                'Permissão Negada',
                '🔒 Apenas administradores podem limpar a fila de músicas!\n\n*Este comando requer permissão de Administrador.*'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!queue || queue.length === 0) {
            const embed = MusicUtils.createInfoEmbed(
                'Fila Já Vazia',
                '📭 A fila já está vazia!'
            );
            return message.reply({ embeds: [embed] });
        }

        const queueLength = queue.length;
        const currentSong = queue[0];

        // Manter apenas a música atual
        client.queues.set(guildId, [currentSong]);

        const embed = MusicUtils.createSuccessEmbed(
            'Fila Limpa',
            `🗑️ **${queueLength - 1}** música${queueLength - 1 !== 1 ? 's foram removidas' : ' foi removida'} da fila por ${message.author.toString()}!`
        );

        embed.addFields(
            { name: '🎵 Música Atual (Mantida)', value: `[${currentSong.title}](${currentSong.url})`, inline: false },
            { name: '📊 Status', value: 'A música atual continuará tocando normalmente.', inline: false }
        );

        message.reply({ embeds: [embed] });
    }
};
