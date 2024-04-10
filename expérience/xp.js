// require("dotenv").config();
// const fs = require('fs');
// const { Client, Intents } = require('discord.js');

// module.exports = (bot, connection) => {

//     // Chargement du fichier XP ou initialisation si non existant
//     let xpData;
//     try {
//       xpData = JSON.parse(fs.readFileSync('xpData.json', 'utf8'));
//     } catch (error) {
//       xpData = {};
//     }
    
//     // Nouveau : Objet pour suivre le dernier message de chaque utilisateur
//     let lastMessageTimestamp = {};

//     // Fonction pour sauvegarder l'XP
//     function saveXpData() {
//       fs.writeFileSync('xpData.json', JSON.stringify(xpData, null, 2), 'utf8');
//     }
    
//     // Événement exécuté à chaque message reçu
//     bot.on('messageCreate', message => {
//       if (message.author.bot) return; // Ignorer les messages des bots
    
//       const userId = message.author.id;
//       const now = Date.now();
//       const lastMessageTime = lastMessageTimestamp[userId] || 0;
//       if (now - lastMessageTime >= 15000) { // 15 secondes ont passé
//           xpData[userId] = (xpData[userId] || 0) + 3;
//           lastMessageTimestamp[userId] = now; // Mettre à jour le timestamp
//           saveXpData();
//           console.log(`${message.author.tag} a maintenant ${xpData[userId]} XP.`);
//       }
//     });
    
//     // Commande !level pour voir son XP
//     bot.on('messageCreate', message => {
//         if (message.content.startsWith('!level')) {
//           const userId = message.author.id;
//           const userXp = xpData[userId] || 0;
//           const userLevel = calculateLevel(userXp); 
//           message.reply(`Tu as ${userXp} points d'XP et tu es niveau ${userLevel}.`);
//         }
//       });

//     // Les functions
//     function calculateLevel(xp) {
//         let level = 1;
//         let xpForNextLevel = 100;
//         while (xp >= xpForNextLevel && level < 150) {
//             xp -= xpForNextLevel;
//             level++;
//             xpForNextLevel *= 1.1;
//         }
//         return level;
//     }
//     function calculerMessagesPourNiveauMax(xpParMessage = 3, niveauMax = 150) {
//         let niveauActuel = 1;
//         let xpTotal = 0;
//         let xpPourProchainNiveau = 100;
    
//         while (niveauActuel < niveauMax) {
//             xpTotal += xpPourProchainNiveau;
//             xpPourProchainNiveau = xpPourProchainNiveau * 1.1; // Ajustement pour rendre les niveaux suivants plus accessibles
//             niveauActuel++;
//         }
    
//         return xpTotal / xpParMessage;
//     }
    
//     console.log(calculerMessagesPourNiveauMax());
    
// }
