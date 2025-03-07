// Importer les dépendances
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();
const nikosImages = require("./images_nikos.json");

// Créer une instance du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Variables d'environnement
const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;
const monId = process.env.MON_ID;
const nikosChannelId = process.env.NIKOS_CHANNEL_ID;

// Message mensuel à envoyer
const monthlyMessage = "N'oublie pas de payer ton abonnement mammouth.ai à Noé (5€ sur paypal)";
let derniereImageNikos = ''

// Variable pour suivre la dernière image utilisée pour éviter les répétitions
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

// Fonction pour envoyer une image aléatoire de Nikos
async function envoyerImageNikosAleatoire() {
  try {
    const channel = await client.channels.fetch(nikosChannelId);
    if (!channel) {
      console.error(`Erreur: Canal ${nikosChannelId} non trouvé`);
      return false;
    }
    
    if (nikosImages.length === 0) {
      await channel.send("Erreur: Aucune image de Nikos disponible!");
      return false;
    }
    
    // Filtrer pour éviter d'envoyer la même image deux fois de suite
    const imagesDisponibles = nikosImages.filter(img => img !== derniereImageNikos);
    
    // Sélectionner une image aléatoire
    const imageAleatoire = imagesDisponibles.length > 0
      ? imagesDisponibles[Math.floor(Math.random() * imagesDisponibles.length)]
      : nikosImages[Math.floor(Math.random() * nikosImages.length)];
    
    // Mémoriser l'image envoyée
    derniereImageNikos = imageAleatoire;
    
    await channel.send({
      content: "📸 Voici votre dose quotidienne de Nikos Aliagas!",
      files: [imageAleatoire]
    });
    
    console.log(`Image de Nikos envoyée le ${new Date().toISOString()}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'image de Nikos:', error);
    return false;
  }
}

// Quand le bot est prêt
client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  
  // Envoyer un message test dès le démarrage du bot
  setTimeout(async () => {
    try {
      const channelRappel = await client.channels.fetch(channelId);
      const channelNikos = await client.channels.fetch(nikosChannelId);

      if (channelRappel) {
        await channelRappel.send('✅ Bot démarré avec succès! Je suis prêt à envoyer des messages de rappel.');
        console.log('Message de test envoyé avec succès');
      } else {
        console.error(`Erreur: Canal ${channelId} non trouvé`);
      }


      if (channelNikos) {
        await channelRappel.send('✅ Bot démarré avec succès! Je suis prêt à envoyer des messages et des photos de Nikos Aliagas.');
        console.log('Message de test envoyé avec succès');
      } else {
        console.error(`Erreur: Canal ${channelId} non trouvé`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message test:', error);
    }
  }, 3000);

  // Planifier l'envoi du message mensuel le 6 de chaque mois à 22h22
  cron.schedule('22 22 6 * *', envoyerMessageMensuel, {
    scheduled: true,
    timezone: "Europe/Paris" 
  });
  
  // Planifier l'envoi de l'image de Nikos tous les jours à 12h00
  cron.schedule('5 14 * * *', envoyerImageNikosAleatoire, {
    scheduled: true,
    timezone: "Europe/Paris"
  });
  
  console.log("Tâches planifiées avec succès");
});

// Gestion des commandes
client.on('messageCreate', async message => {
  // Ignorer les messages des bots pour éviter les boucles
  if (message.author.bot) return;
  
  // Commande pour tester le message mensuel
  if (message.content.toLowerCase() === '!testmessagemensuel') {
    await message.reply('Tentative d\'envoi du message mensuel...');
    const succes = await envoyerMessageMensuel();
    if (succes) {
      await message.reply('Message mensuel envoyé avec succès!');
    } else {
      await message.reply('Erreur lors de l\'envoi du message mensuel.');
    }
  }
  
  // Commande pour tester l'envoi d'une image de Nikos
  if (message.content.toLowerCase() === '!nikos') {
    await message.reply('Je vous envoie une photo de Nikos tout de suite!');
    await envoyerImageNikosAleatoire();
  }
});

// Gestion des erreurs
client.on('error', console.error);

// Connexion du bot à Discord
client.login(token);
