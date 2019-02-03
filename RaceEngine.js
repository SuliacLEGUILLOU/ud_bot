const MongoEngine = require('./MongoEngine')

class RaceEngine {
	constructor(options){
		options = options || {}

		this.mongoEngine = options.mongoEngine || new MongoEngine()
	}
}

module.exports = RaceEngine