const MusicUtils = require('../utils/musicUtils');

module.exports = {
    data: {
        name: 'test',
        aliases: ['teste', 't'],
        description: 'Comando de teste para verificar se o sistema está funcionando',
        usage: '!test'
    },

    async execute(message, args, client) {
        const embed = MusicUtils.createSuccessEmbed(
            'Sistema Funcionando!',
            `🎉 DJ Lhama está funcionando perfeitamente!\n\n**Informações do Sistema:**\n• Comandos carregados: ${client.commands.size}\n• Servidor atual: ${message.guild.name}\n• Prefixo: ${client.config.prefix}\n\n*Criado por Joseok*`
        );

        embed.addFields(
            { name: '🤖 Bot', value: client.user.tag, inline: true },
            { name: '📊 Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: '🎵 Status', value: 'Online e Pronto!', inline: true }
        );

        message.reply({ embeds: [embed] });
    }
};
