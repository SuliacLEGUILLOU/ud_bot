const MongoEngine = require('./MongoEngine')
const DiscordEngine = require('./DiscordEngine')
const RaceEngine = require('./RaceEngine')

class DiscordCommand extends DiscordEngine {
	constructor(options) {
		options = options || {}
		super(options)

		this.mongoEngine = options.mongoEngine || new MongoEngine()
		this.raceEngine = options.raceEngine || new RaceEngine({ mongoEngine: this.mongoEngine })
	}

	start(){}
	help(msg){
		msg.channel.send('start : starts a new race, join : join a race, ready/unready, done/undone, forfeit, quit, entrants : list of entrants, time : time since race started')
	}
	join(){ this.enter }
	enter(){}
	ready(){}
	unready(){}
	done(){}
	undone(){}
	forfeit(){}
	quit(){}
	entrants(){}
	time(){}
	dq(){}
	game(){}
	goal(){}
	private_forcestart(){}
	private_forceclose(){}
}

module.exports = DiscordCommand