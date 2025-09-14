const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'ping',
        aliases: ['latency', 'latencia'],
        description: 'Mostra a latência do bot',
        usage: '!ping'
    },

    async execute(message, args, client) {
        const sent = await message.reply('🏓 Calculando ping...');
        
        const timeTaken = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = MusicUtils.createInfoEmbed(
            '🏓 Pong!',
            `**Latência da Mensagem:** ${timeTaken}ms\n**Latência da API:** ${apiLatency}ms\n\n🦙 **DJ Lhama está funcionando perfeitamente!**\n\n*Criado por Joseok*`
        );

        // Adicionar emoji baseado na latência
        let statusEmoji = '🟢';
        let status = 'Excelente';
        
        if (apiLatency > 100) {
            statusEmoji = '🟡';
            status = 'Bom';
        }
        if (apiLatency > 200) {
            statusEmoji = '🟠';
            status = 'Moderado';
        }
        if (apiLatency > 500) {
            statusEmoji = '🔴';
            status = 'Alto';
        }

        embed.addFields({
            name: `${statusEmoji} Status da Conexão`,
            value: status,
            inline: true
        });

        sent.edit({ content: '', embeds: [embed] });
    }
};
