const { EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");

module.exports = (bot) => {
  async function planifierMessageVendrediSoir() {
    schedule.scheduleJob("50 21 * * 1", async () => {
      try {
        const channel = await bot.channels.fetch("1148182103989698642");

        // Création de l'embed
        const embed = new EmbedBuilder()
          .setTitle("Message Automatique du Vendredi Soir")
          .setDescription(
            "C'est vendredi soir ! Voici votre message automatique."
          )
          .setColor(0x00ae86) // Vous pouvez personnaliser la couleur
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
