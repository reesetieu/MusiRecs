//button functions
function play(accessToken){
    fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT", headers: {Authorization: `Bearer ${accessToken}`}
    })
    console.log("play");
}

function pause(accessToken){
fetch("https://api.spotify.com/v1/me/player/pause", {
    method: "PUT", headers: {Authorization: `Bearer ${accessToken}`}
})
console.log("pause");

}

function skip(){

}

function back(){

}