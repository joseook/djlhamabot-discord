const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'join',
        aliases: ['connect', 'entrar'],
        description: 'Conecta o DJ Lhama ao seu canal de voz',
        usage: '!join'
    },

    async execute(message, args, client) {
        const guildId = message.guild.id;
        
        // Verificar se o usuário está em um canal de voz
        if (!message.member.voice.channel) {
            const embed = MusicUtils.createErrorEmbed(
                'Canal de Voz Necessário',
                '🎤 Você precisa estar em um canal de voz para eu me conectar!\n\nEntre em um canal de voz e use `!join` novamente.'
            );
            return message.reply({ embeds: [embed] });
        }

        const voiceChannel = message.member.voice.channel;

        // Verificar se o bot já está conectado
        if (client.connections.has(guildId)) {
            const currentConnection = client.connections.get(guildId);
            
            // Se já está no mesmo canal
            if (currentConnection.joinConfig.channelId === voiceChannel.id) {
                const embed = MusicUtils.createInfoEmbed(
                    'Já Conectado',
                    `🦙 DJ Lhama já está conectado ao canal **${voiceChannel.name}**!\n\nUse \`!play <música>\` para começar a tocar.`
                );
                return message.reply({ embeds: [embed] });
            }
            
            // Se está em outro canal, desconectar primeiro
            currentConnection.destroy();
            client.connections.delete(guildId);
            if (client.players.has(guildId)) {
                client.players.get(guildId).stop();
                client.players.delete(guildId);
            }
        }

        try {
            // Conectar ao canal de voz
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            client.connections.set(guildId, connection);

            // Criar player se não existir
            if (!client.players.has(guildId)) {
                const player = createAudioPlayer();
                client.players.set(guildId, player);
                connection.subscribe(player);

                // Event listeners do player (mesmo do comando play)
                player.on('error', error => {
                    console.error('Erro no player:', error);
                });
            }

            // Inicializar fila se não existir
            if (!client.queues.has(guildId)) {
                client.queues.set(guildId, []);
            }

            const embed = MusicUtils.createSuccessEmbed(
                'Conectado com Sucesso!',
                `🎵 DJ Lhama se conectou ao canal **${voiceChannel.name}**!\n\n**Próximos passos:**\n• Use \`!play <música>\` para tocar uma música\n• Use \`!help\` para ver todos os comandos\n\n*Criado por Joseok*`
            );

            embed.addFields(
                { name: '🎧 Canal Conectado', value: voiceChannel.name, inline: true },
                { name: '👥 Membros no Canal', value: voiceChannel.members.size.toString(), inline: true },
                { name: '🎮 Comandos Disponíveis', value: '`!play` • `!queue` • `!help`', inline: true }
            );

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao conectar ao canal de voz:', error);
            
            const embed = MusicUtils.createErrorEmbed(
                'Erro de Conexão',
                '❌ Não foi possível conectar ao canal de voz.\n\nVerifique se eu tenho permissões para:\n• Conectar ao canal\n• Falar no canal'
            );
            
            message.reply({ embeds: [embed] });
        }
    }
};
