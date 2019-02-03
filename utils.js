
module.exports = {
	isRacerInRace: function(racerId, racerList){
		for(var i in racerList){
			if(racerList[i].id === racerId){
				return true
			}
		}
		return false
	},
	
	racerToString: function(racer){
		var toReturn = racer.name
	
		if(racer.status == 'join'){
			toReturn += ' (not ready)'
		}
		else if(racer.status == 'done'){
			toReturn += ' finished (' + this.prettyTime(new Date(racer.time))+ ').'
		}
		else if(racer.status ==  'forfeit' || racer.status ==  'dq'){
			toReturn += ' (quit)'
		}
		return toReturn
	},
	
	prettyTime: function(duration){
		if(this.conf.displayMS=='false'){
			return duration.toISOString().substring(duration.toISOString().indexOf('T') + 1).replace(/\..+/, '')
		}
		else{
			return duration.toISOString().substring(duration.toISOString().indexOf('T') + 1).replace('Z', '')
		}
	}
}
