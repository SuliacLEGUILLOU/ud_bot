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

	getRace(raceId){
		return this.race[raceId]
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

		racer.ready = false
		racer.finalTime = null

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

	racerReady(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].ready = true
		next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerUnready(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].ready = false
		next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerDone(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].finalTime = moment(new Date()).add(10, 's').toISOString()
		next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerUndone(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].finalTime = null
		this.race[raceId].runner[racerId].forfeit = false
		next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerForfeit(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].finalTime = null
		this.race[raceId].runner[racerId].forfeit = true
		next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}

	getAllRacer(raceId){
		if (this.race[raceId]) return ''

		var racer = []
		for(var i in this.race[raceId].runner){
			racer.push(i)
		}
		return racer
	}

	messageToRace(msg){}
	messageToRacer(msg){}
	expireRace(raceId){}
}

module.exports = RaceEngine