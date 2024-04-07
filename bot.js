require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mysql = require("mysql2/promise");
const schedule = require("node-schedule");

// Initialisation du client Discord
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function initializeDatabase() {
  let dbConfig;

  if (process.env.JAWSDB_URL) {
    const dbUrl = new URL(process.env.JAWSDB_URL);
    dbConfig = {
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
  } else {
    // Utilisez les variables d'environnement individuelles si JAWSDB_URL n'est pas défini
    dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      port: process.env.DB_PORT, // Assurez-vous d'inclure le port si nécessaire
    };
  }

  const connection = mysql.createPool(dbConfig);
  return connection;
}

async function main() {
  const connection = await initializeDatabase();

  // Initialisation des commandes avec le pool
  const initializeCommands = require("./commands/topenigma.js");
  initializeCommands(bot, connection);

  const initializeCommandsEnigma = require("./commands/enigma.js");
  initializeCommandsEnigma(bot, connection);

  bot.on("ready", () => {
    console.log(`Connecté en tant que ${bot.user.tag}!`);
  });

  bot.login(process.env.TOKEN);
}

main().catch(console.error);
