const MongoEngine = require('./MongoEngine')

class RaceEngine {
	constructor(options){
		options = options || {}

		this.conf = options.conf || {}
		this.mongoEngine = options.mongoEngine || new MongoEngine()
	}

	racerToString(racer){
		console.log('racerToString function called')
		var toReturn
		toReturn = racer.name
		if(racer.status == 'join'){
			toReturn += ' (not ready)'
		}
		else if (racer.status == 'done'){
			var time = new Date(racer.time)
			toReturn += ' finished (' + this.prettyTime(time)+ ').'
		}
		else if (racer.status ==  'forfeit' || racer.status ==  'dq'){
			toReturn += ' (quit)'
		}
		return toReturn
	}

	prettyTime(duration){
		console.log('PrettyTime function called')
		if(this.conf.displayMS=='false'){
			return duration.toISOString().substring(duration.toISOString().indexOf('T') + 1).replace(/\..+/, '')
		}
		else {
			return duration.toISOString().substring(duration.toISOString().indexOf('T') + 1).replace('Z', '')
		}
	}
}

module.exports = RaceEngine