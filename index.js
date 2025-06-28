// ✅ 改善済み index.js
import http from 'http';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

dotenv.config();
const port = process.env.PORT || 3000;

http.createServer((_, res) => res.end('Bot is running')).listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.modals = new Collection();
client.selects = new Collection();

(async () => {
  const basePath = path.resolve();

  // コマンド読み込み
  const commandsPath = path.join(basePath, 'commands');
  for (const file of fs.readdirSync(commandsPath)) {
    if (!file.endsWith('.js')) continue;
    const fileUrl = pathToFileURL(path.join(commandsPath, file)).href;
    const commandModule = await import(fileUrl);
    const command = commandModule.default ?? commandModule;
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }

  // イベント読み込み（with エラーハンドリング）
  const eventsPath = path.join(basePath, 'events');
  for (const file of fs.readdirSync(eventsPath)) {
    if (!file.endsWith('.js')) continue;
    const fileUrl = pathToFileURL(path.join(eventsPath, file)).href;
    const eventModule = await import(fileUrl);
    const event = eventModule.default ?? eventModule;
    if (!event || !event.name || !event.execute) continue;

    if (event.once) {
      client.once(event.name, async (...args) => {
        try {
          await event.execute(...args);
        } catch (e) {
          console.error(`❌ Error in once event ${event.name}:`, e);
        }
      });
    } else {
      client.on(event.name, async (...args) => {
        try {
          await event.execute(...args);
        } catch (e) {
          console.error(`❌ Error in event ${event.name}:`, e);
        }
      });
    }
  }

  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Discord client logged in.');
  } catch (e) {
    console.error('❌ Discord login failed:', e);
    process.exit(1);
  }
})();
