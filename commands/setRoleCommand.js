import { getOrCreateRole } from "../index.js";

export async function setRoleCommand(interaction, gameChannels) {
  try {
    let usersRole = await getOrCreateRole(interaction);
    //setrole for nsfw
    if (interaction.options.getString("channel") === "nsfw") {
      if (interaction.options.getBoolean("remove") === true) {
        interaction.guild.channels.fetch("828395755265720320").then((c) => {
          c.permissionOverwrites.delete(usersRole.id);
        });
        interaction.guild.channels.fetch("792028626517622784").then((c) => {
          c.permissionOverwrites.delete(usersRole.id);
        });
        interaction.reply({
          content: "you can no longer see those channels",
          ephemeral: true,
        });
      } else {
        if (
          interaction.member.roles.cache.find(
            (role) => role.id === "726881878816063528"
          )
        ) {
          interaction.guild.channels.fetch("828395755265720320").then((c) => {
            c.permissionOverwrites.create(usersRole.id, { VIEW_CHANNEL: true });
          });
          interaction.guild.channels.fetch("792028626517622784").then((c) => {
            c.permissionOverwrites.create(usersRole.id, { VIEW_CHANNEL: true });
          });
          interaction.reply({
            content: "you can now see those channels",
            ephemeral: true,
          });
        } else {
          interaction.reply({
            content:
              "only members of the <@&726881878816063528> role are allowed for the nsfw role",
            ephemeral: true,
          });
        }
      }
    } else {
      interaction.guild.channels
        .fetch(gameChannels[interaction.options.getString("channel")])
        .then((c) => {
          if (c !== null) {
            if (interaction.options.getBoolean("remove") === true) {
              c.permissionOverwrites.delete(usersRole.id);
              interaction.reply({
                content: "you can no longer see that channel",
                ephemeral: true,
              });
            } else {
              c.permissionOverwrites.create(usersRole.id, {
                VIEW_CHANNEL: true,
              });
              interaction.reply({
                content: "you can now see that channel",
                ephemeral: true,
              });
            }
          } else {
            console.log("something went wrong; the fetched channel was null");
            interaction.reply({
              content: "Something went wrong; try again.",
              ephemeral: true,
            });
          }
        });
    }
  } catch (e) {
    console.log(e);
    interaction.reply({
      content: "Something went wrong; try again.",
      ephemeral: true,
    });
  }
}
