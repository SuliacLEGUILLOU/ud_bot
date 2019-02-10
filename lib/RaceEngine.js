const MongoEngine = require('./MongoEngine')
const moment = require('moment')
const _ = require('underscore')

class RaceEngine {
	constructor(options){
		options = options || {}

		this.conf = options.conf || {}
		//this.mongoEngine = options.mongoEngine || new MongoEngine()
		this.race = {}
	}

	createRace(race, next){
		if(this.race[race.id]) return next(409)

		race.runner = {}
		this.race[race.id] = race
		if(next) next(null, race)
	}

	deleteRace(race, next){
		if(this.race[race.id]) return next(404)

		delete this.race[race.id]
		if(next) next(null, race)
	}

	getRace(raceId){
		return this.race[raceId]
	}

	updateRace(race, next){
		if(!this.race[race.id]) return next(404)

		this.race[race.id] = race
		if(next) next(null, race)
	}

	startRace(raceId, forceStart, next){
		if(!this.race[raceId]) return next(404)
		//if(this.race[raceId].runner.length < 2) return next(400)

		for(var i in this.race[raceId].runner){
			if(!forceStart && !this.race[raceId].runner[i].ready) return
		}
		this.race[raceId].startTime = moment(new Date()).add(10, 's').toISOString()
		this.race[raceId].forceStart = forceStart
		if(this.race[raceId].channel){ // TODO Refactor this
			this.race[raceId].message = []
			this.race[raceId].message.push(_.debounce(() => {this.race[raceId].channel.send('@here Race started')}, 10000))
			this.race[raceId].message.push(_.debounce(() => {this.race[raceId].channel.send('@here Race start in 1 second')}, 9000))
			this.race[raceId].message.push(_.debounce(() => {this.race[raceId].channel.send('@here Race start in 2 second')}, 8000))
			this.race[raceId].message.push(_.debounce(() => {this.race[raceId].channel.send('@here Race start in 5 second')}, 5000))
			this.race[raceId].channel.send('@here Race start in 10 second')
		}
		if(next) next(null, this.race[raceId])
	}
	unstartRace(raceId, next){
		if(!this.race[raceId]) return 404
		if(!this.race[raceId].startTime || this.race[raceId].forceStart) return 409

		this.race[raceId].startTime = null
		this.race[raceId].forceStart = null
		if(next) next(null, this.race[raceId])
	}

	archiveRace(raceId, next){
		// TODO save this.race[raceId] in database
		if(next) next()
	}

	addRacer(racer, raceId, next){
		if(!this.race[raceId]) return next(404)
		if(this.race[raceId].runner[racer.id]) return next(409)

		racer.ready = false
		racer.finalTime = null

		this.race[raceId].runner[racer.id] = racer
		if(next) next(null, this.race[raceId], racer)
	}

	removeRacer(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		delete this.race[raceId].runner[racerId]
		if(next) next(null, this.race[raceId])
	}

	updateRacer(racer, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racer.id]) return next(404)		

		this.race[raceId].runner[racer.id] = racer
		if(next) next(null, this.race[raceId], racer)
	}

	racerReady(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].ready = true
		if(next) next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerUnready(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].ready = false
		if(next) next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerDone(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].finalTime = moment(new Date()).add(10, 's').toISOString()
		if(next) next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerUndone(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].finalTime = null
		this.race[raceId].runner[racerId].forfeit = false
		if(next) next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}
	racerForfeit(racerId, raceId, next){
		if(!this.race[raceId] || !this.race[raceId].runner[racerId]) return next(404)

		this.race[raceId].runner[racerId].finalTime = null
		this.race[raceId].runner[racerId].forfeit = true
		if(next) next(null, this.race[raceId], this.race[raceId].runner[racerId])
	}

	getAllRacer(raceId){
		if (!this.race[raceId]) return []

		var racer = []
		for(var i in this.race[raceId].runner){
			racer.push(this.race[raceId].runner[i].username)
		}
		return racer
	}

	messageToRace(msg){}
	messageToRacer(msg){}
	expireRace(raceId){}
}

module.exports = RaceEngine