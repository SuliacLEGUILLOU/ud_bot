const Discord = require('discord.js')

class DiscordEngine{
	constructor(options){
		options = options || {}

		this.conf = options.conf || []
		this.auth = options.auth || {}
		this.discord = options.discord || new Discord.Client()

		this._initEvent()
		this.discord.login(this.auth.token)
	}

	_preCommandCheck(){
		return true
	}

	_initEvent(){
		this.discord.on('ready', () => { console.log('Logged in as '+this.discord.user.tag) })
		this.discord.on('error', (e) => console.error(e))
		this.discord.on('warn', (e) => console.warn(e))
		this.discord.on('debug', (e) => console.info(e))
		this.discord.on('message', (msg) => {
			if(msg.author.bot) return
			if(msg.content.substring(0, 1) !== '!' && msg.content.substring(0, 1) !== '.') return
			if(msg.content.substring(1, 2) === '_' || msg.content.substring(1, 8) === 'private') return
			if(!this._preCommandCheck()) return

			var args = msg.content.substring(1).split(' ')
			
			if(this[args[0]]){
				this[args[0]](msg, args)
			} else if(this['private_'+args[0]] && msg.member.roles.some(r=>[this.conf.adminRoleName].includes(r.name))){
				this['private_'+args[0]](msg, args)
			} else{
				msg.channel.send(args[0] + ': Command not found')
			}
		})
	}
}

module.exports = DiscordEngine