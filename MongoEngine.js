var MongoClient = require('mongodb').MongoClient

class MongoEngine {
	constructor(options){
		options = options || {}

		this.url = options.url || 'mongodb://localhost'
		this.dbName = options.dbName || 'races'
		this.db = options.db || null

		MongoClient.connect('mongodb://localhost', function(err, client) {
			if(err){
				console.log('Could not connect to database')
				process.exit(1)
			}

			this.db = client.db(this.dbName)
		})
	}

	getCollection(collectionName){
		if(!this.db) return null // Todo: Make sure the client is initialised

		return this.db.collection(collectionName)
	}

	isReady(){
		return !!this.db
	}
}

module.exports = MongoEngine