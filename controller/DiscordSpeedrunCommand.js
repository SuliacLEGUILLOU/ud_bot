const DiscordEngine = require('../lib/DiscordEngine')
const RaceEngine = require('../lib/RaceEngine')
const moment = require('moment')
const async = require('async')

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
	start(msg){
		var creationTime = moment(new Date())
		var race = {
			creationTime: creationTime,
			channelName: 'Race-'+ creationTime,
			runner: {},
		}
	
		async.series([
			(cb) => {
				//msg.guild.createChannel(channelName).then((result) => { // TODO Why promise ?
				msg.guild.createChannel(race.channelName, (result) => {
					// TODO error management

					race.id = result.id
					cb()
				})
			}, (cb) => {
				this.raceEngine.createRace(race, (err, newRace) => {
					if(err) return cb(err)

					race = newRace
					cb()
				})
			}, (cb) => {
				msg.channel.send('new race starting in channel '+msg.guild.channels.get(race.id).toString())
				msg.guild.channels.get(race.id).send('Race created by '+msg.author+'. Game : '+race.game+'. Goal : '+ race.goal)
				msg.guild.channels.get(race.id).setTopic('Race created by '+msg.author.username+ '. Game : '+race.game+'. Goal : '+ race.goal)
	
				cb()
			}
		], (err) => {
			if(err) return msg.channel.send('Error while creating race.')

			msg.delete().catch(console.error)
		})
	}
	join(msg){ this.enter(msg) }
	enter(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started')
		if(race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are already in the race')
		var user = {
			id: msg.author.username,
		}

		this.raceEngine.addRacer(user, race.id, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while joining the race')

			msg.channel.send(racer.id+' joined the race '+race.id)
			// TODO test for unstart race
		})
	}
	ready(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started')
		if(!race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(race.runner[msg.author.username].ready) return msg.channel.send(msg.author.username+': You are already ready')
		
		this.raceEngine.racerReady(msg.author.username, msg.channel.name, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+': is ready for '+race.id)
			// TODO: Test for start
		})
	}
	unready(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started, do you want to forfeit')
		if(!race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(!race.runner[msg.author.username].ready) return msg.channel.send(msg.author.username+': You are already not ready')
		
		this.raceEngine.racerUnready(msg.author.username, msg.channel.name, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+': is not ready for '+race.id)
			// TODO: Test for unstart race
		})
	}
	done(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(race.runner[msg.author.username].forfeit) return msg.channel.send(msg.author.username+': You have forfeit, want to undone ?')
		if(race.runner[msg.author.username].finalTime) return msg.channel.send(msg.author.username+': You already have finish the race, want to undone ?')

		this.raceEngine.racerDone(msg.author.username, msg.channel.name, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+' is done for '+race.id+', final time: '+racer.finalTime)
			// TODO: Test for archive race
		})
	}
	undone(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(!race.runner[msg.author.username].finalTime) return msg.channel.send(msg.author.username+': You have not finish the race')
		
		this.raceEngine.racerUndone(msg.author.username, msg.channel.name, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+': undone time for '+race.id)
		})
	}
	forfeit(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(race.runner[msg.author.username].forfeit) return msg.channel.send(msg.author.username+': You are already forfeit')
		
		this.raceEngine.racerUndone(msg.author.username, msg.channel.name, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+': undone time for '+race.id)
		})
	}
	quit(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.username]) return msg.channel.send(msg.author.username+': You are not in the race')
		
		delete race.runner[msg.author.username]
		this.raceEngine.updateRacer(race, (err, race) => {
			if(err) return msg.channel.send(msg.author.username+': error while setting self as ready')

			msg.channel.send(msg.author.username+': quit '+race.id)
		})
	}
	entrants(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')

		msg.channel.send('Entrant for '+race.id+' : '+this.raceEngine.getAllRacer(race.id))
	}
	time(msg){
		var race = this.raceEngine.getRace(msg.channel.name)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race not started')

		msg.channel.send(race.id+ ' current time is '+race.startTime)
	}
	dq(){}
	game(msg){
		var race = this.raceEngine.getRace(msg.channel.name)

		msg.channel.send(race.id+ ' game is: '+race.game+', '+race.category)
	}
	private_forcestart(){}
	private_forceclose(){}
}

module.exports = DiscordSpeedrunCommand