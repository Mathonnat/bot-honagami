const { EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");

module.exports = (bot) => {
  async function planifierMessageVendrediSoir() {
    schedule.scheduleJob("30 19 * * 5", async () => {
      try {
        const channel = await bot.channels.fetch("1148182103989698642");

        // Création de l'embed
        const embed = new EmbedBuilder()
          .setTitle("Jeu du mois tous les vendredis !")
          .setDescription(
            "Tous les vendredis du mois d'avril accueilleront un among-us à 21h, n'hésitez pas à venir !"
          )
          .setColor(0x00ff25)
          .setTimestamp();
        // Envoi de l'embed
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error.toString());
      }
    });

    console.log(
      "Message automatique du vendredi soir planifié pour chaque vendredi à 20h00."
    );
  }

  planifierMessageVendrediSoir();
};

