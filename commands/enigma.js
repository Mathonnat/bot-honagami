const { EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");
const mysql = require("mysql2/promise");
require("dotenv").config();

module.exports = async (bot, connection) => {
  let currentEnigmaId = 1;
  let maxEnigmaId = 0;
  const channelId = "1148182103989698642";
  let isEnigmaResolved = false;
  let accepterReponses = true;
  let indiceEnvoye = false;

  // Les emoji
  const emojis = [
    "<:emojiUn:825040051284082747>",
    "<:emojiDeux:825043462952058880>",
    "<:emojiTrois:825043664371187722>",
  ];

  async function initializeGame() {
    await determineMaxEnigmaId();
    planifierEnvoiIndices();
    verifierEtEnvoyerMessageSiEnigmeNonResolue();
  }

  async function getActiveEnigma() {
    const [rows] = await connection.query("SELECT * FROM enigme WHERE id = ?", [
      currentEnigmaId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Détermination de l'ID maximum d'énigme dans la base de données

  async function determineMaxEnigmaId() {
    const [rows] = await connection.query(
      "SELECT MAX(id) AS maxId FROM enigme"
    );
    maxEnigmaId = rows[0]?.maxId || 0;
  }

  bot.on("ready", async () => {
    console.log(`Connecté en tant que ${bot.user.tag}!`);
    await initializeGame();
  });

  // Gestion des message  s et des commandes
  bot.on("messageCreate", async (message) => {
    // Vérifie si le message commence par "!enigme" et si l'utilisateur est administrateur
    if (message.content.startsWith("!enigme")) {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply(
          "Vous n'avez pas la permission d'utiliser cette commande."
        );
      }
      await handleEnigmaCommand(message);
    } else if (message.content.startsWith("!reponse")) {
      await handleResponseCommand(message);
    } else if (message.content.startsWith("!adminenigme")) {
      // La vérification des permissions est déjà en place ici
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply(
          "Vous n'avez pas la permission d'utiliser cette commande."
        );
      }
      const id = message.content.split(" ")[1];
      if (!id || isNaN(id)) {
        return message.reply("Veuillez fournir un ID valide pour l'énigme.");
      }
      await changerEnigmeId(parseInt(id), message);
    }

    // Commande adminenigme

    if (message.content.startsWith("!adminenigme")) {
      // Cette commande ne sera accessible qu'à l'administrateur ou à des rôles spécifiques.
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply(
          "Vous n'avez pas la permission d'utiliser cette commande."
        );
      }

      const id = message.content.split(" ")[1]; // Récupère l'ID à partir de la commande
      if (!id || isNaN(id)) {
        return message.reply("Veuillez fournir un ID valide pour l'énigme.");
      }
      await changerEnigmeId(parseInt(id), message);
    }

    // Fonction pour changer l'ID de l'énigme actuelle
    async function changerEnigmeId(newId, message) {
      // Vérifier si l'ID est dans l'intervalle autorisé
      const enigmeExists = await connection.query(
        "SELECT 1 FROM enigme WHERE id = ?",
        [newId]
      );
      if (enigmeExists[0].length === 0) {
        return message.reply(`Aucune énigme trouvée avec l'ID ${newId}.`);
      }

      currentEnigmaId = newId;
      console.log("Enigme actuelle changée pour ID:", currentEnigmaId);
      message.reply(
        `L'énigme actuelle a été changée pour l'ID ${currentEnigmaId}. La prochaine énigme sera envoyée selon le programme.`
      );
    }

    // Commande adminenigme
  });

  // LOGIQUE ENIGME
  // Ajout d'une nouvelle énigme
  async function handleEnigmaCommand(message) {
    // Demander le thème de l'énigme
    await message.reply("Veuillez entrer le thème de votre énigme:");
    const theme = await collectUserResponse(message);

    // Demander le premier indice
    await message.reply("Veuillez entrer le premier indice:");
    const indice1 = await collectUserResponse(message);

    // Demander le deuxième indice
    await message.reply("Veuillez entrer le deuxième indice:");
    const indice2 = await collectUserResponse(message);

    // Demander le troisième indice
    await message.reply("Veuillez entrer le troisième indice:");
    const indice3 = await collectUserResponse(message);

    // Demander la réponse à l'énigme
    await message.reply("Veuillez entrer la réponse de l'énigme:");
    const reponse = await collectUserResponse(message);

    // Insérer l'énigme dans la base de données
    try {
      const query =
        "INSERT INTO enigme (content, one, two, three, answer, author) VALUES (?, ?, ?, ?, ?, ?)";
      const values = [
        theme,
        indice1,
        indice2,
        indice3,
        reponse,
        message.author.id,
      ]; // Incluez message.author.id pour l'author_id
      const [result] = await connection.query(query, values);
      await determineMaxEnigmaId();
      console.log("Nouvelle énigme ajoutée avec succès.");
      await message.reply("Énigme ajoutée avec succès!");
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'énigme:", err);
      await message.reply(
        "Une erreur est survenue lors de l'ajout de l'énigme."
      );
    }
  }

  async function collectUserResponse(message) {
    return new Promise((resolve) => {
      const filter = (m) => m.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({
        filter,
        max: 1,
        time: 60000,
      });

      collector.on("collect", (m) => {
        resolve(m.content);
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          message.channel.send("Temps écoulé. L'opération a été annulée.");
          resolve(null);
        }
      });
    });
  }
  // LOGIQUE ENIGME
  async function handleResponseCommand(message) {
    const userResponse = message.content.slice("!reponse ".length).trim();

    if (!accepterReponses || !indiceEnvoye) {
      return message.reply(
        "L'énigme actuelle ne peut pas encore être répondue. Attendez le premier indice !"
      );
    }
    // Vérifie si une réponse a été fournie
    if (!userResponse.length) {
      return message.reply("Veuillez fournir une réponse à l'énigme.");
    }

    // Récupération de l'énigme actuelle de la base de données
    const [rows] = await connection.query(
      "SELECT answer FROM enigme WHERE id = ?",
      [currentEnigmaId]
    );
    if (rows.length === 0) {
      return message.reply(
        "Il semble qu'il n'y a pas d'énigme active actuellement."
      );
    }

    const { answer } = rows[0];

    if (userResponse.toLowerCase() === answer.toLowerCase()) {
      isEnigmaResolved = true;
      message.reply("Félicitations! Vous avez trouvé la bonne réponse!");
      await addScore(message.author.id);
      incrementerEnigmeId();
    } else {
      message.reply("Dommage! Ce n'est pas la bonne réponse. Essayez encore!");
    }
  }
  // Fonction pour ajouter un point à l'utilisateur
  async function addScore(userId) {
    const [userScoreRows] = await connection.query(
      "SELECT score FROM user_scores WHERE user_id = ?",
      [userId]
    );
    if (userScoreRows.length === 0) {
      // Insérer un nouveau score pour l'utilisateur
      await connection.query(
        "INSERT INTO user_scores (user_id, score) VALUES (?, 1)",
        [userId]
      );
    } else {
      // Mettre à jour le score existant
      const newScore = userScoreRows[0].score + 1;
      await connection.query(
        "UPDATE user_scores SET score = ? WHERE user_id = ?",
        [newScore, userId]
      );
    }
  }

  async function planifierEnvoiIndices() {
    const horaires = [
      { cron: "50 12 * * 1", indice: 1 },
      { cron: "50 11 * * 2", indice: 2 },
      { cron: "50 11 * * 3", indice: 3 },
    ];

    horaires.forEach((scheduleInfo) => {
      schedule.scheduleJob(scheduleInfo.cron, async () => {
        if (!isEnigmaResolved) {
          await envoyerIndice(scheduleInfo.indice);
          indiceEnvoye = true;
        }
      });
    });

    console.log("Indices programmés pour envoi automatique.");
  }

  async function incrementerEnigmeId() {
    currentEnigmaId = currentEnigmaId < maxEnigmaId ? currentEnigmaId + 1 : 1;
    isEnigmaResolved = false;
    accepterReponses = false;
    indiceEnvoye = false;
    console.log("Passage à l'énigme ID:", currentEnigmaId);
  }

  // Fin d'énigme
  async function verifierEtEnvoyerMessageSiEnigmeNonResolue() {
    const cronFinEnigme = "50 11 * * 4";
    schedule.scheduleJob(cronFinEnigme, async () => {
      if (!isEnigmaResolved) {
        const channel = await bot.channels.fetch(channelId);
        const enigme = await getActiveEnigma();
        channel.send(
          `Malheureusement, personne n'a trouvé la réponse à l'énigme de cette semaine. La réponse était : ${enigme?.answer}. Préparez-vous pour la prochaine énigme !`
        );
        incrementerEnigmeId(); // Assurez-vous que cette ligne est exécutée correctement
      }
    });
  }
  // Planification de la prochaine énigme
  function planifierProchaineEnigme() {
    const cronPourProchaineEnigme = "49 11 * * 1";
    schedule.scheduleJob(cronPourProchaineEnigme, async () => {
      await incrementerEnigmeId();
      planifierEnvoiIndices();
    });
  }
  // Envoie un indice pour l'énigme en cours
  async function envoyerIndice(numIndice) {
    accepterReponses = true;

    const enigme = await getActiveEnigma();
    if (!enigme) {
      console.log("Aucune énigme active trouvée.");
      return;
    }

    try {
      const [results] = await connection.query(
        "SELECT * FROM enigme WHERE id = ?",
        [currentEnigmaId]
      );
      if (results.length === 0) {
        console.log(`Aucune énigme trouvée pour l'ID: ${currentEnigmaId}`);
        return;
      }
      // Définition de la clé d'indice en fonction de numIndice
      const indiceKeys = ["one", "two", "three"];
      const indiceKey = indiceKeys[numIndice - 1];
      const emoji = emojis[numIndice - 1];
      const enigme = results[0];
      const channel = await bot.channels.fetch(channelId);

      // ID du rôle que vous souhaitez mentionner
      const roleId = "824421375468371968";
      const creatorMention = enigme.author
        ? `<@${enigme.author}>`
        : "Créateur inconnu";
      const roleMention = `<@&${roleId}>`;

      // Utilisation des informations de l'énigme pour construire l'embed
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(
          `●～━━━━━━━━━━o Enigme de la semaine #${currentEnigmaId} o━━━━━━━━━━～●`
        )
        .setDescription(
          `${emojis[numIndice - 1]} **Indice**: ${
            enigme[indiceKeys[numIndice - 1]]
          }`
        )
        .addFields({ name: "Thème", value: enigme.content })
        .addFields({ name: "Énigme proposée par", value: creatorMention })
        .setFooter({
          text: `⭐ LES RÉPONSES SONT À DÉPOSER DANS LE SALON #🧠・ℝeponse-enigme ⭐`,
        });

      const messageContent = `${roleMention} \n\nVoici le nouvel indice !`;

      await channel.send({ content: messageContent, embeds: [embed] });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'indice:", err);
    }
  }
};
