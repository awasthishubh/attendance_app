// function calDist(pos1,pos2){
//     var R = 6371e3; // metres
//     var φ1 = pos1.lat * Math.PI / 180;
//     var φ2 = pos2.lat * Math.PI / 180;
//     var Δφ = (pos2.lat-pos1.lat) * Math.PI / 180;
//     var Δλ = (pos2.lng-pos1.lng) * Math.PI / 180;

//     var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//             Math.cos(φ1) * Math.cos(φ2) *
//             Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//     return R * c;
// }
function calDist(pos1,pos2){
    lat1=pos1.lat
    lon1=pos1.lng
    lat2=pos2.lat
    lon2=pos2.lng
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		dist = dist * 1609.34
		return dist;
	}
}


function updateInRange(org, mem){
    console.log(org.members[mem])
    if(!mem){
        for(var mem in org.members){
            var dist=calDist(org.members[mem].pos,org.adminDetails.pos)
            org.members[mem].inRange=dist<org.threshold
            org.members[mem].dist=dist
        }
    }
    else{
        
        var dist=calDist(org.members[mem].pos,org.adminDetails.pos)
        org.members[mem].inRange=dist<org.threshold
        org.members[mem].dist=dist
    }
}



// console.log(calDist({lat:12.9723, lng:79.1557},{lat:12.972306, lng:79.156181}))

function disconnect(socket,lobby,io){
    console.log('user disconnected')
    if(socket.type=='admin'){
        socket.broadcast.to(socket.org).emit('lobbyClosed');
        delete lobby[socket.org];
        socket.org=undefined;
        socket.type=undefined;
    }
    if(socket.type=='mem'){
        if(lobby[socket.org]){
            console.log(lobby[socket.org].members[socket.details.reg])
            delete lobby[socket.org].members[socket.details.reg]
            socket.broadcast.to(socket.org).emit('userDis',socket.details);
            io.to(lobby[socket.org].adminDetails.id).emit('allMem',lobby[socket.org].members)
            socket.reg=socket.org=undefined;
            socket.type=undefined;
        }
    }
}

module.exports=async function(io, lobby,download){
    find=await require('../db/db')()
    
    io.on('connection',(socket)=>{

        socket.on('lobbyDetails',()=>{
            console.log()
            console.log()
            console.log()
            console.log(lobby)
            // console.log(lobby[socket.org])
            console.log('members')
            // console.log(lobby[socket.org].members)
            console.log()
            console.log()
            console.log()
        })
        console.log('New User Joined')

        require('./admin')(io,socket,lobby,download,updateInRange)
        require('./member')(io,socket,lobby,updateInRange)
        console.log()
            console.log()
            console.log()
            console.log(updateInRange)
            console.log()
            console.log()
            console.log()
        socket.on('disconnect',(message,err)=>{ //automatic disconnect
            disconnect(socket,lobby,io)
        })
        socket.on('disconnectMe',(message,err)=>{ //manual disconnect
            disconnect(socket,lobby,io)
        })

    })
}