const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'volume',
        aliases: ['vol', 'v'],
        description: 'Ajusta o volume da música (0-100)',
        usage: '!volume [0-100]'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        const player = client.players.get(guildId);

        // Verificações
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Canal',
                'Você precisa estar em um canal de voz para usar este comando!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!player) {
            const embed = MusicUtils.createErrorEmbed(
                'Player Inativo',
                'Não há música tocando no momento!'
            );
            return message.reply({ embeds: [embed] });
        }

        // Se não foi fornecido volume, mostrar volume atual
        if (!args.length) {
            // Inicializar volume do servidor se não existir
            if (!client.serverVolumes) {
                client.serverVolumes = new Map();
            }
            
            const currentVolume = client.serverVolumes.get(guildId) || client.config.defaultVolume;
            
            const embed = MusicUtils.createInfoEmbed(
                'Volume Atual',
                `🔊 Volume atual: **${currentVolume}%**\n\nUse \`!volume <0-100>\` para alterar o volume.`
            );
            return message.reply({ embeds: [embed] });
        }

        const volume = parseInt(args[0]);

        // Validar volume
        if (isNaN(volume) || volume < 0 || volume > 100) {
            const embed = MusicUtils.createErrorEmbed(
                'Volume Inválido',
                'Por favor, forneça um valor entre **0** e **100**.\n\n**Exemplo:** `!volume 50`'
            );
            return message.reply({ embeds: [embed] });
        }

        // Inicializar mapa de volumes se não existir
        if (!client.serverVolumes) {
            client.serverVolumes = new Map();
        }

        // Definir volume
        client.serverVolumes.set(guildId, volume);

        // Aplicar volume ao resource atual (se houver)
        const resource = player.state.resource;
        if (resource && resource.volume) {
            resource.volume.setVolume(volume / 100);
        }

        // Emoji baseado no volume
        let volumeEmoji = '🔇';
        if (volume > 0 && volume <= 33) volumeEmoji = '🔉';
        else if (volume > 33 && volume <= 66) volumeEmoji = '🔊';
        else if (volume > 66) volumeEmoji = '📢';

        const embed = MusicUtils.createSuccessEmbed(
            'Volume Alterado',
            `${volumeEmoji} Volume definido para **${volume}%** por ${message.author.toString()}`
        );

        message.reply({ embeds: [embed] });
    }
};
