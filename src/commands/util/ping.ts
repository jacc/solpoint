import { ChatCommand } from "../../types/command";

export const ping: ChatCommand = {
  name: "ping",
  description: "Checks that the bot is online.",
  type: "CHAT_INPUT",
  inhibitors: [],
  async run(interaction) {
    await interaction.reply({
      content:
        "Pong! The bot is online.\n\n[Follow the creator on Twitter](<https://twitter.com/laf0nd>) | [View the source on GitHub](<https://twitter.com/jacc/solpoint>)",
      ephemeral: true,
    });
  },
};
