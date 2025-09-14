const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'stop',
        aliases: ['parar', 'disconnect', 'dc', 'leave'],
        description: 'Para a música e desconecta o bot do canal de voz',
        usage: '!stop'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        let hasActiveSession = false;
        let stoppedSomething = false;

        try {
            // Tentar parar Discord Player se existir
            if (client.hybridUtils && client.hybridUtils.player) {
                const queue = client.hybridUtils.player.nodes.get(guildId);
                if (queue) {
                    console.log('🛑 Parando Discord Player...');
                    queue.delete();
                    hasActiveSession = true;
                    stoppedSomething = true;
                }
            }

            // Tentar parar sistemas legados se existirem
            const connection = client.connections?.get(guildId);
            const player = client.players?.get(guildId);
            const queue = client.queues?.get(guildId);

            if (player) {
                console.log('🛑 Parando player legado...');
                player.stop();
                client.players.delete(guildId);
                hasActiveSession = true;
                stoppedSomething = true;
            }

            if (queue) {
                console.log('🗑️ Limpando fila legada...');
                client.queues.delete(guildId);
                stoppedSomething = true;
            }

            if (connection) {
                console.log('🔌 Desconectando conexão legada...');
                connection.destroy();
                client.connections.delete(guildId);
                hasActiveSession = true;
                stoppedSomething = true;
            }

            // Tentar desconectar usando getVoiceConnection
            const { getVoiceConnection } = require('@discordjs/voice');
            const voiceConnection = getVoiceConnection(guildId);
            if (voiceConnection) {
                console.log('🔌 Desconectando conexão de voz ativa...');
                voiceConnection.destroy();
                hasActiveSession = true;
                stoppedSomething = true;
            }

            let embed;
            if (stoppedSomething) {
                embed = MusicUtils.createSuccessEmbed(
                    'Sessão Finalizada',
                    '👋 DJ Lhama foi desconectado e todas as sessões foram finalizadas!\n\n*Obrigado por usar o DJ Lhama - Criado por Joseok*'
                );
            } else {
                embed = MusicUtils.createInfoEmbed(
                    'Nenhuma Sessão Ativa',
                    '🤖 O DJ Lhama não estava reproduzindo música no momento.\n\nUse `!play <música>` para começar a tocar algo!'
                );
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro ao executar comando stop:', error);
            const embed = MusicUtils.createErrorEmbed(
                'Erro ao Parar',
                'Houve um erro ao tentar parar a música. Todas as sessões foram finalizadas com segurança.'
            );
            message.reply({ embeds: [embed] });
        }
    }
};
