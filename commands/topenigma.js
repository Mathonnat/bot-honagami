require("dotenv").config();

module.exports = (bot, connection) => {
  bot.on("messageCreate", async (message) => {
    if (message.content.startsWith("!topenigme")) {
      const query =
        "SELECT user_id, username, score FROM user_scores ORDER BY score DESC LIMIT 10";
      try {
        const [results] = await connection.query(query);
        if (results.length === 0) {
          message.channel.send("Aucun score trouvé.");
          return;
        }
        let rankingMessage = "🏆 **Top des énigmes** 🏆\n\n";
        results.forEach((row, index) => {
          rankingMessage += `**${index + 1}. <@${row.user_id}>** - ${
            row.score
          } points\n`;
        });
        message.channel.send(rankingMessage);
      } catch (err) {
        console.error("Erreur lors de la récupération des scores :", err);
        message.channel.send(
          "Une erreur est survenue lors de la récupération des scores."
        );
      }
    } else if (message.content.startsWith("!giveenigme")) {
      const args = message.content.split(" ");
      const user = message.mentions.users.first();
      const pointsToAdd = parseInt(args[2], 10) || 1;

      if (!user) {
        message.reply("Veuillez mentionner un utilisateur.");
        return;
      }

      const query = `
        INSERT INTO user_scores (user_id, username, score)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE score = score + VALUES(score);
      `;

      try {
        await connection.query(query, [user.id, user.username, pointsToAdd]);
        message.reply(
          `${user.username} a maintenant ${pointsToAdd} points supplémentaires !`
        );
      } catch (err) {
        console.error("Erreur lors de l'ajout de points :", err);
        message.reply("Une erreur est survenue lors de l'ajout de points.");
      }
    } else if (message.content.startsWith("!deleteenigme")) {
      const args = message.content.split(" ");
      const user = message.mentions.users.first();
      const pointsToRemove = parseInt(args[2], 10) || 1;

      if (!user) {
        message.reply("Veuillez mentionner un utilisateur.");
        return;
      }

      const query = `UPDATE user_scores SET score = GREATEST(score - ?, 0) WHERE user_id = ?;`;

      try {
        await connection.query(query, [pointsToRemove, user.id]);
        message.reply(
          `${user.username} a maintenant ${pointsToRemove} points en moins.`
        );
      } catch (err) {
        console.error("Erreur lors de la suppression de points :", err);
        message.reply(
          "Une erreur est survenue lors de la suppression de points."
        );
      }
    }
  });
};
