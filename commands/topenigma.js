require("dotenv").config();

module.exports = (bot, connection) => {
  const channelId = "1148182103989698642";

  bot.on("messageCreate", async (message) => {
    if (message.content.startsWith("!topenigme")) {
      const query = "SELECT user_id, username, score FROM user_scores ORDER BY score DESC LIMIT 10";
      connection.query(query, (err, results) => {
        if (err) {
          console.error("Erreur lors de la récupération des scores :", err);
          message.channel.send("Une erreur est survenue lors de la récupération des scores.");
          return;
        }
        // Si aucun score n'est trouvé
        if (results.length === 0) {
          message.channel.send("Aucun score trouvé.");
          return;
        }

        // Création du message de classement
        let rankingMessage = "🏆 **Top des énigmes** 🏆\n\n";
        results.forEach((row, index) => {
          rankingMessage += `**${index + 1}. <@${row.user_id}>** - ${row.score} points\n`;
        });

        // Envoie du message sur le canal
        message.channel.send(rankingMessage);
      });
    } else if (message.content.startsWith("!giveenigme")) {
      const args = message.content.split(" ");
      const user = message.mentions.users.first();
      const pointsToAdd = parseInt(args[2], 10) || 1;

      if (user) {
        const query = `
          INSERT INTO user_scores (user_id, username, score)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE score = score + VALUES(score);
        `;

        connection.query(
          query,
          [user.id, user.username, pointsToAdd],
          (err, results) => {
            if (err) {
              console.error("Erreur lors de l'ajout de points :", err);
              message.reply(
                "Une erreur est survenue lors de l'ajout de points."
              );
            } else {
              message.reply(
                `${user.username} a maintenant ${pointsToAdd} points supplémentaires !`
              );
            }
          }
        );
      }
    } else if (message.content.startsWith("!deleteenigme")) {
      const args = message.content.split(" ");
      const user = message.mentions.users.first();
      const pointsToRemove = parseInt(args[2], 10) || 1;

      if (user) {
        const query = `UPDATE user_scores SET score = GREATEST(score - ?, 0) WHERE user_id = ?;`;

        connection.query(query, [pointsToRemove, user.id], (err, results) => {
          if (err) {
            console.error("Erreur lors de la suppression de points :", err);
            message.reply(
              "Une erreur est survenue lors de la suppression de points."
            );
          } else {
            message.reply(
              `${user.username} a maintenant ${pointsToRemove} points en moins.`
            );
          }
        });
      }
    }
  });
};
