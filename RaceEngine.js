const MongoEngine = require('./MongoEngine')
const utils = require('./utils')

class RaceEngine {
	constructor(options){
		options = options || {}

		this.conf = options.conf || {}
		this.mongoEngine = options.mongoEngine || new MongoEngine()
	}

	createRace(){}
	deleteRace(){}
	getRace(){}
	updateRace(){}
	archiveRace(){}

	addRacer(race, racer, next){
		if(utils.isRacerInRace(racer.id, race)) return next(racer.author + ' is already in the race')
		
		race.runner[racer.id] = racer
		this.mongoEngine.getCollection('liveraces').updateOne({channelId : race.channelId}, {$set: {racers : race}}, next)
	}

	removerRacer(race, racer, next){
		delete race.runner[racer.id]
		this.mongoEngine.getCollection('liverace').updateOne({channelId : race.channelId}, {$set: {racers : race}}, next)
	}

	setRacerState(race, racer, state, next){
		race.runner[racer.id].ready = !!state
		this.mongoEngine.getCollection('liverace').updateOne({channelId : race.channelId}, {$set: {racers : race}}, next)
	}

	updateRacer(){}
}

module.exports = RaceEngine