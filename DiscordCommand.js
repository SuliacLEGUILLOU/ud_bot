const MongoEngine = require('./MongoEngine')
const DiscordEngine = require('./DiscordEngine')
const RaceEngine = require('./RaceEngine')

class DiscordCommand extends DiscordEngine {
	constructor(options) {
		options = options || {}
		super(options)

		this.mongoEngine = options.mongoEngine || new MongoEngine()
		this.raceEngine = options.raceEngine || new RaceEngine(options)
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
	entrants(msg){
		this.mongoEngine.getColletion('liveraces').find({channelid : msg.channel.id}, { projection: { racers: 1}}).toArray(function(err, result) {
			if(!result || !result[0]) return
			
			if(result[0].racers.length === 0) return msg.channel.send('Nobody joined the race yet.')
			for (var i in result[0].racers) {
				msg.channel.send(this.raceEngine.racerToString(result[0].racers[i]))
			}
		})
	}
	time(){}
	dq(){}
	game(){}
	goal(){}
	private_forcestart(){}
	private_forceclose(){}
}

module.exports = DiscordCommand