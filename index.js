const DiscordCommand = require('./controller/DiscordSpeedrunCommand')
const MongoEngine = require('./lib/MongoEngine')
const auth = require('./auth.json')
const conf = require('./conf.json')

function start(){
	//var mongoEngine = new MongoEngine()
	var discordCommand = new DiscordCommand({ auth: auth, conf: conf})
}

start()
