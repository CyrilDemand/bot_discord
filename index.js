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
const monthlyMessage = "N'oublie pas de payer ton abonnement mammouth.ai à Noé (5€ sur paypal)";

// Fonction pour envoyer le message mensuel
async function envoyerMessageMensuel() {
  try {
    console.log("Tentative d'envoi du message mensuel...");
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const messageAvecMentions = `
        Salut <@${monId}>!
        
        ${monthlyMessage}
      `;
      
      await channel.send(messageAvecMentions);
      console.log(`Message mensuel envoyé le ${new Date().toISOString()}`);
      return true;
    } else {
      console.error(`Erreur: Canal ${channelId} non trouvé`);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message :', error);
    return false;
  }
}

// Quand le bot est prêt
client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  
  // Envoyer un message test dès le démarrage du bot
  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (channel) {
        await channel.send('✅ Bot démarré avec succès! Je suis prêt à rappeler aux gens de payer leurs abonnements !');
        console.log('Message de test envoyé avec succès');
      } else {
        console.error(`Erreur: Canal ${channelId} non trouvé`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message test:', error);
    }
  }, 3000);

  // Planifier l'envoi du message le 6 de chaque mois à 22h22
  cron.schedule('00 10 7 * *', envoyerMessageMensuel, {
    scheduled: true,
    timezone: "Europe/Paris" // Ajustez selon votre fuseau horaire
  });
  
  // Log pour confirmer la planification
  console.log("Tâche cron planifiée pour le 7 de chaque mois à 10:00");
  
  // Commande pour tester le message manuellement
  client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === '!testmessagemensuel') {
      await message.reply('Tentative d\'envoi du message mensuel...');
      const succes = await envoyerMessageMensuel();
      if (succes) {
        await message.reply('Message mensuel envoyé avec succès!');
      } else {
        await message.reply('Erreur lors de l\'envoi du message mensuel.');
      }
    }
  });
});
  
// Gestion des erreurs
client.on('error', console.error);

// Connexion du bot à Discord
client.login(token);
