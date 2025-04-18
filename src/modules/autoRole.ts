import type { GuildMember, PartialGuildMember, ContextMenuCommandInteraction, Message, Role } from "discord.js";
import { BotModule } from "./bot";
import Config from "../utils/config";
import logger from "../utils/logger";

export default class AutoRole extends BotModule {
    
    private readonly roles: Array<Role> = []
    
    async init(): Promise<void> {
        for (const roleId of Config.autorole.rolesId) {
            const role = await this.bot.guild?.roles.fetch(roleId)
            if (role) {
                this.roles.push(role)
                logger.info(`Role: [${role.name}] added to autorole list`)
            }
        }
    }

    async messageCreate(message: Message): Promise<void> {
        if (message.channelId != Config.autorole.channel) {
            return
        }

        const member = await this.bot.guild?.members.fetch(message.author.id)

        if (!member) { return }

        if (member.user.createdAt > new Date('2024-12-01T00:00:00Z')) {
            message.react("🟥")
            return
        }

        await member.roles.add(this.roles)
        message.react("🟩")
    }

    async memberJoined(member: GuildMember): Promise<void> {}
    async memberLeft(member: GuildMember | PartialGuildMember): Promise<void> {}
    async contextInteraction(interaction: ContextMenuCommandInteraction): Promise<void> {}    
}