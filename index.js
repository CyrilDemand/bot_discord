// Importer les dépendances
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

// Créer une instance du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Variables d'environnement
const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;
const monId = process.env.MON_ID;

// Message mensuel à envoyer
const monthlyMessage = "Voici votre message mensuel automatique !";

// Quand le bot est prêt
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    
    // Envoyer un message test dès le démarrage du bot
    setTimeout(async () => {
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          await channel.send('✅ Bot démarré avec succès! Je suis prêt à envoyer des messages mensuels.');
          console.log('Message de test envoyé avec succès');
        } else {
          console.error(`Erreur: Canal ${channelId} non trouvé`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message test:', error);
      }
    }, 3000); // Attendre 3 secondes pour être sûr que tout est initialisé
  
    // Planifier l'envoi du message le 6 de chaque mois à 9h00
    // Format cron: minute heure jour mois jour_de_semaine
    cron.schedule('0 9 6 * *', async () => {
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          // Mentionner des utilisateurs dans le message mensuel
          // Vous pouvez mentionner des utilisateurs spécifiques ou des rôles
          const messageAvecMentions = `
            Salut <@monId>!
            
            ${monthlyMessage}
          `;
          
          await channel.send(messageAvecMentions);
          console.log(`Message mensuel envoyé le ${new Date().toISOString()}`);
        } else {
          console.error(`Erreur: Canal ${channelId} non trouvé`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message :', error);
      }
    });
  });
  
// Gestion des erreurs
client.on('error', console.error);

// Connexion du bot à Discord
client.login(token);
