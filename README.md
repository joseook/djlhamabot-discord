# 🦙 DJ Lhama - Bot de Música para Discord

**DJ Lhama** é um bot de música completo e personalizado para Discord, criado por **Joseok**. Este bot oferece uma experiência musical rica e interativa para seus servidores Discord.

## ✨ Características Principais

- 🎵 **Reprodução de Música**: Toque músicas do YouTube com alta qualidade
- 📋 **Gerenciamento de Fila**: Sistema completo de fila com controles avançados
- 🔊 **Controle de Volume**: Ajuste o volume de 0 a 100%
- 🔄 **Modos de Repetição**: Loop de música individual ou fila completa
- 🔀 **Embaralhamento**: Misture sua fila de músicas
- 🎤 **Letras de Músicas**: Exiba letras usando a API do Genius
- 🔍 **Busca Avançada**: Busque e escolha músicas interativamente
- ⏯️ **Controles Completos**: Pause, retome, pule e pare músicas
- 🎨 **Interface Bonita**: Embeds coloridos e informativos
- 🔒 **Controles de Administrador**: Comandos restritos para administradores

## 🚀 Comandos Disponíveis

### 🎤 Conexão e Reprodução
- `!join` - Conecta o DJ Lhama ao seu canal de voz
- `!play <música>` - Toca uma música ou adiciona à fila
- `!search <música>` - Busca músicas e permite escolher
- `!pause` - Pausa a música atual
- `!resume` - Retoma a música pausada
- `!skip` - Pula para a próxima música
- `!stop` - Para a música e desconecta o bot

### 📋 Gerenciamento de Fila
- `!queue [página]` - Mostra a fila atual
- `!nowplaying` - Informações da música atual
- `!remove <posição>` - Remove uma música da fila
- `!skipto <posição>` - Pula para uma música específica
- `!shuffle` - Embaralha a fila
- `!clearqueue` - Limpa toda a fila (Admin)

### 🔧 Controles
- `!volume [0-100]` - Ajusta ou mostra o volume
- `!loop [song/queue/off]` - Controla o modo de repetição

### 🎤 Diversão
- `!lyrics [música]` - Mostra a letra da música
- `!ping` - Verifica a latência do bot

### ℹ️ Informações
- `!help [comando]` - Lista todos os comandos ou ajuda específica

## 📦 Instalação

### Pré-requisitos
- Node.js 16.9.0 ou superior
- NPM ou Yarn
- FFmpeg instalado no sistema
- Token de bot do Discord
- (Opcional) API Key do YouTube
- (Opcional) Token do Genius para letras

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd djlhamabot-discord
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Edite o arquivo `.env` com suas configurações:**
```env
DISCORD_TOKEN=seu_token_do_discord_aqui
YOUTUBE_API_KEY=sua_chave_youtube_aqui (opcional)
GENIUS_ACCESS_TOKEN=seu_token_genius_aqui (opcional)
DEFAULT_PREFIX=!
BOT_OWNER_ID=seu_id_discord_aqui
BOT_STATUS_CHANNEL_ID=id_do_canal_bot_status (opcional)
```

5. **Execute o bot:**
```bash
npm start
```

## 🔧 Configuração

### Obter Token do Discord
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá para a seção "Bot"
4. Copie o token e cole no arquivo `.env`

### Obter API Key do YouTube (Opcional)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a YouTube Data API v3
4. Crie credenciais (API Key)
5. Cole a chave no arquivo `.env`

### Obter Token do Genius (Opcional)
1. Acesse [Genius API](https://genius.com/api-clients)
2. Crie uma nova aplicação
3. Copie o Access Token
4. Cole no arquivo `.env`

## 🎛️ Configurações Personalizáveis

No arquivo `.env` você pode configurar:

- `DEFAULT_PREFIX`: Prefixo dos comandos (padrão: `!`)
- `DEFAULT_VOLUME`: Volume padrão (padrão: `50`)
- `MAX_QUEUE_SIZE`: Tamanho máximo da fila (padrão: `100`)
- `DISCONNECT_TIMEOUT`: Tempo para desconectar por inatividade (padrão: `300000`ms)

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
djlhamabot-discord/
├── commands/           # Comandos do bot
├── utils/             # Utilitários e helpers
├── index.js           # Arquivo principal
├── package.json       # Dependências
├── .env.example       # Exemplo de configuração
└── README.md          # Este arquivo
```

### Adicionando Novos Comandos
1. Crie um arquivo na pasta `commands/`
2. Use a estrutura padrão:
```javascript
module.exports = {
    data: {
        name: 'comando',
        aliases: ['alias1', 'alias2'],
        description: 'Descrição do comando',
        usage: '!comando <parâmetros>'
    },
    async execute(message, args, client) {
        // Lógica do comando
    }
};
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Joseok** - Criador do DJ Lhama

## 🙏 Agradecimentos

- Discord.js pela excelente biblioteca
- YouTube e Genius pelas APIs
- Comunidade open source

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões:

1. Abra uma issue no GitHub
2. Entre em contato com Joseok
3. Consulte a documentação dos comandos com `!help`

---

**🦙 DJ Lhama - Trazendo música e diversão para seu servidor Discord!**

*Criado com ❤️ por Joseok*
