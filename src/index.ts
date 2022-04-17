import "dotenv/config";

import { Client, Intents } from "discord.js";
import {
  chatCommandsMap,
  messageCommandsMap,
  userCommandsMap,
} from "./commands";
import { prisma } from "./services/prisma";
import { redis } from "./services/redis";
import { isDev } from "./constants";
import { handleInteraction } from "./services/events/interaction";
import signale from "signale";
import { scheduleJob } from "node-schedule";
import fetch from "node-fetch";
const myIntents = new Intents(["GUILDS"]);

const client = new Client({
  intents: myIntents,
  allowedMentions: { parse: ["users", "roles"], repliedUser: false },
});

client.on("ready", async () => {
  signale.info("Environment:", isDev ? "dev" : "prod");
  signale.success("Ready as", client.user?.tag);

  await client.user?.setPresence({
    status: "online",
    activities: [
      {
        type: "WATCHING",
        name: `github.com/jacc`,
      },
    ],
  });

  if (isDev) {
    if (!process.env.DEVELOPMENT_ID) {
      throw new Error("DEVELOPMENT_ID is not set, exiting...");
    }

    await client.guilds.cache
      .get(process.env.DEVELOPMENT_ID)
      ?.commands.set([
        ...chatCommandsMap.values(),
        ...messageCommandsMap.values(),
        ...userCommandsMap.values(),
      ]);

    signale.success("Loaded all commands");
  } else {
    signale.info("Setting application commands...");
    await client.application?.commands.set([
      ...chatCommandsMap.values(),
      ...messageCommandsMap.values(),
      ...userCommandsMap.values(),
    ]);
  }
});

client.on("interactionCreate", handleInteraction);

scheduleJob("*/10 * * * * *", async () => {
  const req = await fetch(
    "https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );

  const res = await req.json();

  const guilds = await client.guilds.cache;

  await client.user?.setPresence({
    status: "online",
    activities: [
      {
        type: "WATCHING",
        name: `+${parseFloat(res.priceChange).toFixed(2)} (${parseFloat(
          res.priceChangePercent
        ).toFixed(2)}%)`,
      },
    ],
  });

  guilds.forEach(async (guild) => {
    guild.me?.setNickname(
      `${parseFloat(res.lastPrice).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })} (${res.priceChangePercent.includes("-") ? "↘" : "↗"})`
    );
  });
});

client.login(process.env.DISCORD_TOKEN);
signale.info("Connected to Discord");
