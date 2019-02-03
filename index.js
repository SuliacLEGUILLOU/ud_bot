const DiscordCommand = require('./DiscordCommand')
const MongoEngine = require('./MongoEngine')
const auth = require('./auth.json')
const conf = require('./conf.json')

function start() {
	var mongoEngine = new MongoEngine()
	var discordCommand = new DiscordCommand({ mongoEngine: mongoEngine, auth: auth, conf: conf})
}

start()
