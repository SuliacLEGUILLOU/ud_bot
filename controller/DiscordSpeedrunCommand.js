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
		return true
		//return super._preCommandCheck() && this.mongoEngine.isReady()
	}

	help(msg){
		msg.channel.send('create : starts a new race, join : join a race, ready/unready, done/undone, forfeit, quit, entrants : list of entrants, time : time since race started')
	}
	create(msg){
		var creationTime = moment(new Date())
		var race = {
			creationTime: creationTime,
			channelName: 'Race-'+ creationTime,
			runner: {},
		}
	
		async.series([
			(cb) => {
				msg.guild.createChannel(race.channelName, 'text').then((result) => {
					// TODO error management

					race.id = result.id
					race.channel = msg.guild.channels.get(result.id)
					cb()
				})
			}, (cb) => {
				this.raceEngine.createRace(race, (err, newRace) => {
					if(err) return cb(err)

					race = newRace
					cb()
				})
			}, (cb) => {
				//msg.channel.send('new race starting in channel '+msg.guild.channels.get(race.id).toString())
				race.channel.send('Race created by '+msg.author+'. Game : '+race.game+'. Goal : '+ race.goal)
				//msg.guild.channels.get(race.id).setTopic('Race created by '+msg.author.username+ '. Game : '+race.game+'. Goal : '+ race.goal)
	
				cb()
			}
		], (err) => {
			if(err) return msg.channel.send('Error while creating race.')

			msg.delete().catch(console.error)
		})
	}
	join(msg){ this.enter(msg) }
	enter(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started')
		if(race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are already in the race')
		var user = {
			id: msg.author.tag,
			username: msg.author.username,
		}

		this.raceEngine.addRacer(user, race.id, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while joining the race')

			msg.channel.send(racer.username+' joined the race '+race.id)
			this.raceEngine.unstartRace(race.id)
		})
	}
	ready(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started')
		if(!race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(race.runner[msg.author.tag].ready) return msg.channel.send(msg.author.username+': You are already ready')
		
		this.raceEngine.racerReady(msg.author.tag, msg.channel.id, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+': is ready for '+race.id)
			this.raceEngine.startRace(race.id, false)
		})
	}
	unready(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started, do you want to forfeit')
		if(!race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(!race.runner[msg.author.tag].ready) return msg.channel.send(msg.author.username+': You are already not ready')
		
		this.raceEngine.racerUnready(msg.author.tag, msg.channel.id, (err, race, racer) => {
			if(err) return msg.channel.send(msg.author.username+': error while setting self as ready')

			msg.channel.send(racer.username+': is not ready for '+race.id)
			this.raceEngine.unstartRace(race.id)
		})
	}
	done(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(race.runner[msg.author.tag].forfeit) return msg.channel.send(msg.author.username+': You have forfeit, want to undone ?')
		if(race.runner[msg.author.tag].finalTime) return msg.channel.send(msg.author.username+': You already have finish the race, want to undone ?')

		this.raceEngine.racerDone(msg.author.tag, msg.channel.id, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+' is done for '+race.id+', final time: '+racer.finalTime)
			// TODO: Test for archive race
		})
	}
	undone(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(!race.runner[msg.author.tag].finalTime && !race.runner[msg.author.tag].forfeit) return msg.channel.send(msg.author.username+': You have nothing to undone')
		
		this.raceEngine.racerUndone(msg.author.tag, msg.channel.id, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.id+': undone time for '+race.id)
		})
	}
	forfeit(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race is not started')
		if(!race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are not in the race')
		if(race.runner[msg.author.tag].forfeit) return msg.channel.send(msg.author.username+': You are already forfeit')
		
		this.raceEngine.racerForfeit(msg.author.tag, msg.channel.id, (err, race, racer) => {
			if(err) return msg.channel.send(racer.id+': error while setting self as ready')

			msg.channel.send(racer.username+': forfeit from '+race.id)
		})
	}
	quit(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race is started, want to forfeit?')
		if(!race.runner[msg.author.tag]) return msg.channel.send(msg.author.username+': You are not in the race')

		this.raceEngine.removeRacer(msg.author.tag, race.id, (err, race) => {
			if(err) return msg.channel.send(msg.author.username+': error while setting self as ready')

			msg.channel.send(msg.author.username+': quit race '+race.id)
			this.raceEngine.startRace(race.id, false)
		})
	}
	entrants(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')

		msg.channel.send('Entrant for '+race.id+' : '+this.raceEngine.getAllRacer(race.id).join(', '))
	}
	time(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(!race.startTime) return msg.channel.send(msg.author.username+': Race not started')

		msg.channel.send(race.id+ ' current time is '+race.startTime)
	}
	game(msg){
		var race = this.raceEngine.getRace(msg.channel.id)

		msg.channel.send(race.id+ ' game is: '+race.game+', '+race.category)
	}
	private_dq(){}
	private_forcestart(msg){
		var race = this.raceEngine.getRace(msg.channel.id)
		if(!race) return msg.channel.send(msg.author.username+': Race not found')
		if(race.startTime) return msg.channel.send(msg.author.username+': Race already started')

		this.raceEngine.startRace(race.id, true)
	}
	private_forceclose(){}
}

module.exports = DiscordSpeedrunCommand