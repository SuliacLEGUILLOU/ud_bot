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

	_preCommandCheck(){
		return super._preCommandCheck() && this.mongoEngine.isReady()
	}

	start(){}
	help(msg){
		msg.channel.send('start : starts a new race, join : join a race, ready/unready, done/undone, forfeit, quit, entrants : list of entrants, time : time since race started')
	}

	join(msg){ this.enter(msg) }
	enter(msg){
		this.mongoEngine.getCollection('liveraces').find({channelid : msg.channel.id}, { projection: {channelid: 1, racers: 1, status: 1 }}).toArray(function(err, result) {
			if (err || !result || result.length === 0) return
			if (result[0].status !== 'new') return msg.channel.send('Race has already started')

			if (result[0].racers.length > 0) {
				var currentRacers = result[0].racers
				if (this.raceEngine.isRacerInRace(msg.author.id, currentRacers)) return msg.channel.send(msg.author + ' is already in the race')
				
				currentRacers.push({id : msg.author.id, name : msg.author.username, status : 'join', time : 'notfinished'})
				var setToAdd = {$set: {racers : currentRacers}}
				this.mongoEngine.getCollection('liveraces').updateOne({channelid : msg.channel.id}, setToAdd,function(err) {
					if (err) throw err
					msg.channel.send(msg.author + ' joined the race!')
				})
			}
			else {
				var premierRacer = {$set: {racers : [{id : msg.author.id, name : msg.author.username, status : 'join', time : 'notfinished'}]}}

				this.mongoEngine.getCollection('liveraces').updateOne({channelid : msg.channel.id}, premierRacer,function(err) {
					if (err) throw err
					msg.channel.send(msg.author + ' joined the race!')
				})
			}
		})
	}

	ready(){}
	unready(){}
	done(){}
	undone(){}
	forfeit(){}
	quit(){}
	entrants(msg){
		this.mongoEngine.getColletion('liveraces').find({channelid : msg.channel.id}, { projection: { racers: 1}}).toArray(function(err, result) {
			if (err || !result || !result[0]) return
			
			if (result[0].racers.length === 0) return msg.channel.send('Nobody joined the race yet.')
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