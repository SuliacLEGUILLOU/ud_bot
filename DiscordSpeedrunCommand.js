const DiscordEngine = require('./DiscordEngine')
const RaceEngine = require('./RaceEngine')

class DiscordSpeedrunCommand extends DiscordEngine {
	constructor(options) {
		options = options || {}
		super(options)

		this.raceEngine = options.raceEngine || new RaceEngine(options)
	}

	_preCommandCheck(){
		return super._preCommandCheck() && this.mongoEngine.isReady()
	}

	help(msg){
		msg.channel.send('start : starts a new race, join : join a race, ready/unready, done/undone, forfeit, quit, entrants : list of entrants, time : time since race started')
	}
	start(msg){}
	join(msg){ this.enter(msg) }
	enter(msg){}
	ready(){}
	unready(msg){}
	done(){}
	undone(){}
	forfeit(){}
	quit(){}
	entrants(msg){}
	time(){}
	dq(){}
	game(){}
	goal(){}
	private_forcestart(){}
	private_forceclose(){}
}

module.exports = DiscordSpeedrunCommand