const schedule = require("node-schedule");

module.exports = (bot) => {
  function planifierMessageVendrediSoir() {
    // Planifie le job pour s'exécuter à 18h30 chaque lundi
    schedule.scheduleJob("05 21 * * 1", async () => {
      try {
        const channel = await bot.channels.fetch("1148182103989698642");
        // Envoie un message texte classique
        await channel.send(
          "Tous les vendredis du mois d'avril accueilleront un among-us à 21h, n'hésitez pas à venir !"
        );
      } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error.toString());
      }
    });

    console.log(
      "Message automatique pour le vendredi soir planifié pour chaque lundi à 18h30."
    );
  }

  planifierMessageVendrediSoir();
};
