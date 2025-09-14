const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'loop',
        aliases: ['repeat', 'repetir'],
        description: 'Ativa/desativa o modo de repetição (música atual ou fila)',
        usage: '!loop [song/queue/off]'
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

        if (!queue || queue.length === 0) {
            const embed = MusicUtils.createErrorEmbed(
                'Fila Vazia',
                'Não há músicas tocando no momento!'
            );
            return message.reply({ embeds: [embed] });
        }

        // Inicializar configurações de loop se não existir
        if (!client.loopSettings) {
            client.loopSettings = new Map();
        }

        const currentLoop = client.loopSettings.get(guildId) || 'off';
        const arg = args[0]?.toLowerCase();

        let newLoopMode;
        let description;
        let emoji;

        switch (arg) {
            case 'song':
            case 'musica':
            case 's':
                newLoopMode = 'song';
                description = '🔂 **Modo Loop: Música Atual**\n\nA música atual será repetida indefinidamente.';
                emoji = '🔂';
                break;
            
            case 'queue':
            case 'fila':
            case 'q':
                newLoopMode = 'queue';
                description = '🔁 **Modo Loop: Fila Completa**\n\nToda a fila será repetida quando chegar ao fim.';
                emoji = '🔁';
                break;
            
            case 'off':
            case 'disable':
            case 'desativar':
                newLoopMode = 'off';
                description = '⏹️ **Loop Desativado**\n\nAs músicas tocarão normalmente sem repetição.';
                emoji = '⏹️';
                break;
            
            default:
                // Toggle entre os modos
                if (currentLoop === 'off') {
                    newLoopMode = 'song';
                    description = '🔂 **Modo Loop: Música Atual**\n\nA música atual será repetida indefinidamente.';
                    emoji = '🔂';
                } else if (currentLoop === 'song') {
                    newLoopMode = 'queue';
                    description = '🔁 **Modo Loop: Fila Completa**\n\nToda a fila será repetida quando chegar ao fim.';
                    emoji = '🔁';
                } else {
                    newLoopMode = 'off';
                    description = '⏹️ **Loop Desativado**\n\nAs músicas tocarão normalmente sem repetição.';
                    emoji = '⏹️';
                }
                break;
        }

        client.loopSettings.set(guildId, newLoopMode);

        const embed = MusicUtils.createSuccessEmbed(
            'Modo Loop Alterado',
            `${description}\n\nAlterado por: ${message.author.toString()}`
        );

        embed.addFields(
            { name: 'Modo Anterior', value: currentLoop === 'off' ? '⏹️ Desativado' : currentLoop === 'song' ? '🔂 Música' : '🔁 Fila', inline: true },
            { name: 'Modo Atual', value: newLoopMode === 'off' ? '⏹️ Desativado' : newLoopMode === 'song' ? '🔂 Música' : '🔁 Fila', inline: true },
            { name: 'Comandos', value: '`!loop song` • `!loop queue` • `!loop off`', inline: false }
        );

        message.reply({ embeds: [embed] });
    }
};
