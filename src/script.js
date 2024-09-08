import {redirectToAuthCodeFlow, getAccessToken} from "./authCodePkce.js";
//import {play, pause, skip, back} from "./player.js";
const clientId = "b6b8ff8a322340a4b2d0a31bdc0eb7eb";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const TIME_RANGE = "medium_term";
const NUMTRACKS = 10;

//MAIN HOME DRIVER
if (!code){
    redirectToAuthCodeFlow(clientId);
}
else{
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    populateUI(profile);
    const topTracks = await fetchTopTracks(accessToken);
    console.log(topTracks);
    console.log(topTracks.items[0].artists[0].name + " - " + topTracks.items[0].name)
    populateTopTracks(topTracks);
    const recTracks = await fetchRecTracks(accessToken, topTracks);
    console.log(recTracks);
    populateRecTracks(recTracks);


    //buttons
    document.getElementById("genplay").addEventListener("click", function () {
        const result = generatePlaylist(accessToken, profile, recTracks);
        console.log(result);
    });
    document.getElementById("qplay").addEventListener("click", function () {
        addToQueue(accessToken, recTracks);
    });
    document.getElementById("p/pbtn").addEventListener("click", function () {
        playpause(accessToken);
    });
    document.getElementById("skipbtn").addEventListener("click", function () {
        skip(accessToken);
    });
    document.getElementById("backbtn").addEventListener("click", function () {
        back(accessToken);
    });
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

function populateUI(profile){
    // TODO: update ui with profile data
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(100, 100);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}

async function fetchTopTracks(token) {
    const result = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${NUMTRACKS}&time_range=${TIME_RANGE}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}`}
    });

    return await result.json();
}

function populateTopTracks(tracks) {
    for(let i = 0; i < NUMTRACKS; i++){
        var li = document.createElement("li");
        var text = document.createTextNode(tracks.items[i].artists[0].name + " - " + tracks.items[i].album.name + " - " + tracks.items[i].name);
        var a = document.createElement("a");
        a.appendChild(text);
        a.title = tracks.items[i].external_urls.spotify;
        a.href = tracks.items[i].external_urls.spotify;
        li.appendChild(a);
        document.getElementById("toptracks").appendChild(li);
    }
}

async function fetchRecTracks(token, topTracks) {
    let numtracks = 5;
    if(NUMTRACKS < 5){
        numtracks = NUMTRACKS;
    }

    let trackids = "";
    for(let i = 0; i < numtracks; i++){
        if(i != 0){
            trackids += ",";
        }
        trackids += topTracks.items[i].id;
    }
    const result = await fetch(`https://api.spotify.com/v1/recommendations?limit=${NUMTRACKS}&seed_tracks=${trackids}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}`}
    });

    return await result.json();
}

function populateRecTracks(tracks) {
    for(let i = 0; i < NUMTRACKS; i++){
        var li = document.createElement("li");
        var text = document.createTextNode(tracks.tracks[i].artists[0].name + " - " + tracks.tracks[i].album.name + " - " + tracks.tracks[i].name);
        var a = document.createElement("a");
        a.appendChild(text);
        a.title = tracks.tracks[i].external_urls.spotify;
        a.href = tracks.tracks[i].external_urls.spotify;
        li.appendChild(a);
        document.getElementById("recs").appendChild(li);
    }
}

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

async function dpp(accessToken){
    const result = await fetch("https://api.spotify.com/v1/me/player", {
        method: "GET", headers: {Authorization: `Bearer ${accessToken}`}
    })
    return await result.json();
}

async function playpause(accessToken){
    const result = await dpp(accessToken);

    if(result.is_playing){
        pause(accessToken);
    }else{
        play(accessToken);
    }
}

function skip(accessToken){
    fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST", headers: {Authorization: `Bearer ${accessToken}`}
    })
    console.log("skip");

}

function back(accessToken){
    fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST", headers: {Authorization: `Bearer ${accessToken}`}
    })
    console.log("back");

    }

function addToQueue(token, tracks){
    for(let i = 0; i < NUMTRACKS; i++){
        fetch(`https://api.spotify.com/v1/me/player/queue?uri=${tracks.tracks[i].uri}`,{
            method: "POST", headers: {Authorization: `Bearer ${token}`}
        });
    }
}

async function generatePlaylist(accessToken, profile, recTracks){
    const result = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
        method: "POST",
        headers: {Authorization: `Bearer ${accessToken}`},
        body: JSON.stringify({
            name: "Spotify Recs Playlist",
            public: false,
            description: "Spotify Recs App playlist generated through Spotify Recommendation API"
        })

    });
    console.log(result);
    const playlist = await result.json();
    let trackids = "";
    for(let i = 0; i < NUMTRACKS; i++){
        if(i != 0){
            trackids += ",";
        }
        trackids += recTracks.tracks[i].uri;
    }
    console.log(trackids);

    const result2 = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks?uris=${trackids}`, {
    method: "POST",
    headers: {Authorization: `Bearer ${accessToken}`},
    });
    console.log(result2);

    return result;
}