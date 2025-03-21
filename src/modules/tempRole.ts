import { sql } from "bun"
import type { ContextMenuCommandInteraction, GuildMember, PartialGuildMember, Role, Snowflake } from "discord.js"
import Config from "../utils/config"
import { BotModule } from "./bot"

export default class TempRole extends BotModule {
	async contextInteraction(interaction: ContextMenuCommandInteraction): Promise<void> {
		
	}
	private readonly roles: Array<Role> = []
	private readonly checkInterval: number = Math.floor(Config.tempRole.checkInterval * 1000 * 60 * 100)
	private readonly timeToRemove: number = Math.floor(Config.tempRole.roleDuration * 60 * 100)

	// Creates the database tables and starts the checking process
	public async init() {
		for (const roleId of Config.tempRole.rolesId) {
			const role = await this.bot.guild?.roles.fetch(roleId)
			if (role) {
				this.roles.push(role)
			}
		}
		this.checkRoles()
		setInterval(() => {
			this.checkRoles()
		}, this.checkInterval)
	}

	// Saves user into database and adds the roles
	public async memberJoined(member: GuildMember) {
		console.log("Member joind")
		try {
			await sql`
                INSERT INTO temp_roles (user_id, created_at) 
                VALUES (${member.id}, NOW())
            `
		} catch (error) {
			console.error(`Failed to add user [${member.id}] into database`, error)
		}

		member.roles.add(this.roles)
	}

	// Removes user from database
	public async memberLeft(member: GuildMember | PartialGuildMember) {
		try {
			await sql`DELETE FROM temp_roles WHERE user_id = ${member.id}`
		} catch (error) {
			console.error(`Failed to remove user [${member.id}] from database`, error)
		}
	}

	// Deletes all expired users from database and removes their roles
	private async checkRoles() {
		console.log("Checking roles")
		try {
			const deletedUsers = await sql`
                DELETE FROM temp_roles
                WHERE created_at < NOW() - INTERVAL '${this.timeToRemove} seconds'
                RETURNING user_id
            `
			
			for (const user of deletedUsers) {
				const member = await this.bot.guild?.members.fetch(user.user_id)
				if (!member) {
					return
				}
				member.roles.remove(this.roles)
			}
		} catch (error) {
			console.error("Failed to delete users from database", error)
		}
	}
}
