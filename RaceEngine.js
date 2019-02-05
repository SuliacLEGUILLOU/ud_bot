const MongoEngine = require('./MongoEngine')
const moment = require('moment')

class RaceEngine {
	constructor(options){
		options = options || {}

		this.conf = options.conf || {}
		this.mongoEngine = options.mongoEngine || new MongoEngine()
		this.race = {}
	}

	createRace(race, next){
		if(this.race[race.id]) return next(409)

		race.runner = {}
		this.race[race.id] = race
		next(null, race)
	}

	deleteRace(race, next){
		if(this.race[race.id]) return next(404)

		delete this.race[race.id]
		next(null, race)
	}

	getRace(raceId, next){
		if(!this.race[raceId]) return next(404)

		next(null, this.race[raceId])
	}

	updateRace(race, next){
		if(!this.race[race.id]) return next(404)

		this.race[race.id] = race
		next(null, race)
	}

	startRace(raceId, next){
		if(!this.race[raceId]) return next(404)

		this.race[raceId].startTime = moment(new Date()).add(10, 's').toISOString()
		next(null, this.race[raceId])
	}

	archiveRace(raceId, next){
		// TODO save this.race[raceId] in database
		next()
	}

	addRacer(racer, raceId, next){
		if(!this.race[raceId]) return next(404)
		if(this.race[raceId].runner[racer.id]) return next(409)

		this.race[raceId].runner[racer.id] = racer
		next(null, this.race[raceId], racer)
	}

	removerRacer(racer, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racer.id]) return next(404)

		delete this.race[raceId].runner[racer.id]
		next(null, this.race[raceId], racer)
	}

	updateRacer(racer, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racer.id]) return next(404)		

		this.race[raceId].runner[racer.id] = racer
		next(null, this.race[raceId], racer)
	}

	racerDone(racer, raceId, next){
		if(this.race[raceId] || this.race[raceId].runner[racer.id]) return next(404)

		this.race[raceId].runner[racer.id].time = moment(new Date()).toISOString()
		next(null, this.race[raceId].runner[racer.id])
	}

	messageToRace(msg){}
	messageToRacer(msg){}
}

module.exports = RaceEngine