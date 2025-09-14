const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const HybridMusicUtils = require('./utils/hybridMusicUtils');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// DJ Lhama Bot - Criado por Joseok
console.log('🦙 Iniciando DJ Lhama Bot...');
console.log('👨‍💻 Criado por: Joseok');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
});

// Configurações do bot
client.config = {
    prefix: process.env.DEFAULT_PREFIX || '!',
    ownerId: process.env.BOT_OWNER_ID,
    defaultVolume: parseInt(process.env.DEFAULT_VOLUME) || 50,
    maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE) || 100,
    disconnectTimeout: parseInt(process.env.DISCONNECT_TIMEOUT) || 300000,
};

// Collections para comandos e dados do servidor
client.commands = new Collection();
client.queues = new Collection();
client.players = new Collection();
client.connections = new Collection();

// Sistema Híbrido de Música
client.hybridMusic = null;

// Inicializar sistema híbrido após o bot estar pronto
function initializeHybridMusic() {
    try {
        client.hybridMusic = new HybridMusicUtils(client);
        console.log('✅ Sistema Híbrido de Música inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar Sistema Híbrido:', error);
        client.hybridMusic = null;
    }
}

// Função para enviar status do bot
async function sendBotStatusEmbed(client) {
    try {
        const statusChannelId = process.env.BOT_STATUS_CHANNEL_ID;
        if (!statusChannelId) {
            console.log('⚠️ BOT_STATUS_CHANNEL_ID não configurado no .env');
            return;
        }

        const statusChannel = client.channels.cache.get(statusChannelId);
        if (!statusChannel) {
            console.log('❌ Canal de status não encontrado');
            return;
        }

        const startTime = new Date();
        const totalServers = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const botVersion = '1.0.0';

        const statusEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🦙 Bot Online')
            .setDescription('**DJ Lhama** está agora online e funcionando!')
            .addFields(
                {
                    name: '🔧 Inicializado em',
                    value: `<t:${Math.floor(startTime.getTime() / 1000)}:F>`,
                    inline: false
                },
                {
                    name: '🏓 Ping',
                    value: `${client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: '🏠 Servidores',
                    value: totalServers.toString(),
                    inline: true
                },
                {
                    name: '👥 Usuários',
                    value: totalUsers.toString(),
                    inline: true
                },
                {
                    name: '💾 Memória',
                    value: `${memoryUsage}MB`,
                    inline: true
                },
                {
                    name: '🔧 Versão',
                    value: botVersion,
                    inline: true
                }
            )
            .setFooter({ text: 'DJ Lhama • Criado por Joseok' })
            .setTimestamp();

        const requiredPermissions = [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages];
        const botPermissionsInChannel = statusChannel.guild.members.me.permissionsIn(statusChannel);

        if (!botPermissionsInChannel.has(requiredPermissions)) {
            console.log(`❌ O bot não tem permissão para enviar mensagens no canal ${statusChannel.name}. Por favor, conceda as permissões de \`Ver Canal\` e \`Enviar Mensagens\`.`);
            return;
        }

        await statusChannel.send({ embeds: [statusEmbed] });
        console.log('✅ Status do bot enviado para o canal bot-status');

    } catch (error) {
        console.error('❌ Erro ao enviar status do bot:', error);
    }
}

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando carregado: ${command.data.name}`);
        } else {
            console.log(`⚠️ Comando em ${filePath} está faltando propriedades "data" ou "execute".`);
        }
    }
}

// Event: Bot pronto
client.once('clientReady', async () => {
    console.log('🎵 DJ Lhama está online e pronto para tocar!');
    console.log(`🤖 Logado como: ${client.user.tag}`);
    console.log(`🎧 Servindo ${client.guilds.cache.size} servidores`);
    console.log(`📋 Total de comandos carregados: ${client.commands.size}`);
    console.log(`🔧 Prefixo configurado: ${client.config.prefix}`);
    
    // Listar comandos carregados
    if (client.commands.size > 0) {
        console.log('📝 Comandos disponíveis:');
        client.commands.forEach((command, name) => {
            console.log(`   • ${name} (aliases: ${command.data.aliases?.join(', ') || 'nenhum'})`);
        });
    } else {
        console.log('⚠️ ATENÇÃO: Nenhum comando foi carregado!');
    }
    
    // Status do bot
    client.user.setActivity('🎵 Música para todos! | !help', { type: 'LISTENING' });
    
    // Debug: Verificar permissões do bot
    client.guilds.cache.forEach(guild => {
        console.log(`🏠 Servidor: ${guild.name} (ID: ${guild.id})`);
        const botMember = guild.members.me;
        if (botMember) {
            console.log(`   🔑 Permissões do bot: ${botMember.permissions.toArray().join(', ')}`);
        } else {
            console.log(`   ❌ Bot não encontrado como membro do servidor`);
        }
    });
    
    // Inicializar Sistema Híbrido de Música
    initializeHybridMusic();
    
    // Enviar status para canal bot-status
    await sendBotStatusEmbed(client);
});

// Event: Mensagens
client.on('messageCreate', async (message) => {
    // Debug: Log todas as mensagens que não são de bots
    if (!message.author.bot) {
        console.log(`📨 Mensagem recebida: "${message.content}" de ${message.author.tag}`);
    }
    
    if (message.author.bot || !message.content.startsWith(client.config.prefix)) return;

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    console.log(`🔍 Procurando comando: "${commandName}"`);
    console.log(`📝 Argumentos: [${args.join(', ')}]`);

    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName));

    if (!command) {
        console.log(`❌ Comando "${commandName}" não encontrado`);
        console.log(`📋 Comandos disponíveis: ${Array.from(client.commands.keys()).join(', ')}`);
        return;
    }
    
    console.log(`✅ Comando "${commandName}" encontrado! Executando...`);

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Erro ao executar comando ${commandName}:`, error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erro!')
            .setDescription('Houve um erro ao executar este comando.')
            .setFooter({ text: 'DJ Lhama • Criado por Joseok' })
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
});

// Event: Desconexão de voz
client.on('voiceStateUpdate', (oldState, newState) => {
    // Se o bot foi desconectado
    if (oldState.member.id === client.user.id && !newState.channelId) {
        const guildId = oldState.guild.id;
        
        // Limpar dados do servidor
        if (client.queues.has(guildId)) {
            client.queues.delete(guildId);
        }
        if (client.players.has(guildId)) {
            const player = client.players.get(guildId);
            player.stop();
            client.players.delete(guildId);
        }
        if (client.connections.has(guildId)) {
            client.connections.delete(guildId);
        }
    }
});

// Event: Erro
client.on('error', (error) => {
    console.error('Erro do Discord.js:', error);
});

// Login do bot
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Erro ao fazer login:', error);
    console.log('💡 Verifique se o token do bot está correto no arquivo .env');
});
