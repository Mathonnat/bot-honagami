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
    dbConfig = {
      host: "localhost",
      user: "root",
      password: "",
      database: "bot",
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

  const initializeCommandsCommand = require("./commands/command.js");
  initializeCommandsCommand(bot, connection);

  bot.on("ready", () => {
    console.log(`Connecté en tant que ${bot.user.tag}!`);
  });

  bot.login(process.env.TOKEN);
}

main().catch(console.error);
