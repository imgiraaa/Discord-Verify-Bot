const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Bot siap! Login sebagai ${client.user.tag}`);

        client.user.setPresence({
            activities: [
                {
                    name: "Verification Bot By Gira | Github Giraaa.",
                    type: ActivityType.Watching
                }
            ],
            status: "idle" // Status: online, idle, dnd (do not disturb), invisible
        });

        console.log(
            `Profile bot status successfuly loaded..`
        );
    }
};
