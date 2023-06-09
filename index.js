let latitude;
let longitude;

let ArtistDataList;
let TrackList;

window.onload = function(){
    getPosition();
}

function getPosition() {
    navigator.geolocation.getCurrentPosition(getPositionSuccess);
}

async function getPositionSuccess(position) {
    let loadElem = document.getElementById('load');
    loadElem.classList.remove('no-display');
    
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    
    initMap();
    
    let bodyElem = document.getElementsByTagName('body')[0];
    
    let addressData = await getAddress(latitude, longitude);
    let prefecture = addressData['prefecture'];
    // let prefecture = '岡山県';
    document.querySelector('#header-top').innerHTML = '<div id="prefecture"><button id="pre-button" onclick="displayPre(\''+prefecture+'\')">'+prefecture+'</button></div>';
    
    let artistHtml = await getArtistData(prefecture);
    artistList = await organizeArtistList(artistHtml);
    
    let artistsList = [];
    for(let i=0; i<artistList.length; i++){
        let artistDict = {};
        let phpRes = await getImg(artistList[i]);
        if(phpRes != null){
            let artistID = phpRes['id'];
            let artistImgUrl = (phpRes['images'].length > 0) ? phpRes['images'][0]['url'] : '';
            
            artistDict[artistList[i]] = [artistID, artistImgUrl];
            artistsList.push(artistDict);
        }
    }

    ArtistDataList = artistsList;
    displayMap();
}

function displayMap(){
    let loadElem = document.getElementById('load');
    loadElem.classList.remove('no-display');
    
    let mapElem = document.getElementById('map');
    let preElem = document.getElementById('prefecture-display');
    let artElem = document.getElementById('artist-display');
    mapElem.classList.remove('no-display');
    preElem.classList.add('no-display');
    artElem.classList.add('no-display');
    
    let innerHtmlText = '';
    let firstRow = '<div id="artist-list">';
    let secondRow = '<div id="artist-list">';
    for(let i=0; i<ArtistDataList.length; i++){
        let name = Object.keys(ArtistDataList[i])[0];
        let img = ArtistDataList[i][name][1];
        
        if(i % 2 == 0){
            firstRow += '<div id="artist-row" class='+name+'>';
            firstRow += '<button id="artist-box" onclick="displayArt('+i+')">';
            firstRow += '<img id="artist-img" src="'+img+'">';
            firstRow += '<p id="m-artist-name">'+name+'</p>';
            firstRow += '</button></div>';
        }else if(i % 2 == 1){
            secondRow += '<div id="artist-row" class='+name+'>';
            secondRow += '<button id="artist-box" onclick="displayArt('+i+')">';
            secondRow += '<img id="artist-img" src="'+img+'">';
            secondRow += '<p id="m-artist-name">'+name+'</p>';
            secondRow += '</button></div>';
        }
    }
    
    innerHtmlText = firstRow + '</div>' + secondRow + '</div>';
    document.querySelector('#artist-list-top').innerHTML = innerHtmlText;
    
    loadElem.classList.add('no-display');
}

async function displayArt(cntNum){
    let loadElem = document.getElementById('load');
    loadElem.classList.remove('no-display');
    
    let mapElem = document.getElementById('map');
    let preElem = document.getElementById('prefecture-display');
    let artElem = document.getElementById('artist-display');
    mapElem.classList.add('no-display');
    preElem.classList.add('no-display');
    artElem.classList.remove('no-display');
    
    let name = Object.keys(ArtistDataList[cntNum])[0];
    let id = ArtistDataList[cntNum][name][0];
    TrackList = await getTrack(id);
    
    
    let innerHtmlText = '<p id="a-artist-name">'+name+'</p>';
    for(let i=0; i<TrackList.length; i++){
        innerHtmlText += '<div id="a-track-box">';
        innerHtmlText += '<p id="a-track-name">'+TrackList[i][0]+'</p>';
        innerHtmlText += '<div id="a-track-link">';
        innerHtmlText += '<button id="a-track-spotify" onclick="window.open(\''+TrackList[i][1]+'\')"><img id="spotify-icon" src="./spotify_icon.png">';
        innerHtmlText += 'Spotifyで聴く</button>';
        innerHtmlText += '<button id="a-track-preview" onclick="window.open(\''+TrackList[i][2]+'\')">プレビューを聴く</button>';
        innerHtmlText += '</div></div>';
    }
    
    innerHtmlText += '<button id="exit-art" onclick="displayMap()">戻る</button>';
    document.querySelector('#artist-display').innerHTML = innerHtmlText;
    
    loadElem.classList.add('no-display');
}

async function displayPre(prefecture){
    let loadElem = document.getElementById('load');
    loadElem.classList.remove('no-display');
    
    let mapElem = document.getElementById('map');
    let preElem = document.getElementById('prefecture-display');
    let artElem = document.getElementById('artist-display');
    mapElem.classList.add('no-display');
    preElem.classList.remove('no-display');
    artElem.classList.add('no-display');
    
    let rdmNum = Math.floor(Math.random() * ArtistDataList.length-1);
    if(rdmNum < 0) rdmNum = 0;
    let name = Object.keys(ArtistDataList[rdmNum])[0];
    let id = ArtistDataList[rdmNum][name][0];
    let tList = await getTrack(id);
    
    rdmNum = Math.floor(Math.random() * tList.length-1);
    if(rdmNum < 0) rdmNum = 0;
    let innerHtmlText = '<p id="a-artist-name">'+name+'</p>';
    innerHtmlText += '<div id="a-track-box">';
    innerHtmlText += '<p id="a-track-name">'+tList[rdmNum][0]+'</p>';
    innerHtmlText += '<div id="a-track-link">';
    innerHtmlText += '<button id="a-track-spotify" onclick="window.open(\''+tList[rdmNum][1]+'\')"><img id="spotify-icon" src="./spotify_icon.png">';
    innerHtmlText += 'Spotifyで聴く</button>';
    innerHtmlText += '<button id="a-track-preview" onclick="window.open(\''+tList[rdmNum][2]+'\')">プレビューを聴く</button>';
    innerHtmlText += '</div></div>';
    
    innerHtmlText += '<button id="exit-art" onclick="displayMap()">戻る</button>';
    document.querySelector('#prefecture-display').innerHTML = innerHtmlText;
    
    loadElem.classList.add('no-display');
}

function getAddress(lat, lon) {
    return new Promise((resolve) => {
        let url = 'https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&y='+lat+'&x='+lon;
        
        fetch(url, {
            method: 'GET'
        }).then((res) => {
            return res.json();
        }).then((json) => {
            resolve(json['response']['location'][0]);
        });
    })
}

function getArtistData(prefecture) {
    return new Promise((resolve) => {
        let url = 'https://ja.wikipedia.org/w/api.php?origin=*&format=json&action=parse&prop=text&page='+prefecture+'出身の人物一覧';
        fetch(url, {
            method: 'POST'
        }).then((res) => {
            return res.json();
        }).then((json) => {
            let parser = new DOMParser();
            let result = parser.parseFromString(json['parse']['text']['*'], 'text/html');
                        
            resolve(result);
        });
    });
}

function organizeArtistList(html){
    return new Promise((resolve) => {
        let dataList = [];
        let jobList = ['ミュージシャン', 'シンガーソングライター', 'バンド', '歌手'];
        
        for(let i=0; i<jobList.length; i++){
            let idDoc = html.getElementById(jobList[i]);
            if(idDoc !== null){
                let h3Elem = idDoc.parentElement;
                let ulElem = h3Elem.nextElementSibling;
                let liElemNum = ulElem.childElementCount;
                
                for(let j=0; j<liElemNum; j++){
                    let firstChild = ulElem.children[j].firstChild;
                    
                    let name = '';
                    if(firstChild.tagName === 'A'){
                        name = firstChild.getAttribute('title');
                        dataList.push(name);
                    }
                }
            }
        }
        
        resolve(dataList);
    });
}

function getImg(name) {
    return new Promise((resolve) => {
        name = name.replace(/\(|\)|\s/g, '');
        let url = 'https://mobilesystem.azurewebsites.net/gps_test_2/getImg.php?artist='+name;
        fetch(url, {
            method: 'GET'
        }).then((res) => {
            return res.json();
        }).then((json) => {
            resolve(json);
        });
    });
}

function getTrack(id) {
    return new Promise((resolve) => {
        name = name.replace(/\(|\)|\s/g, '');
        let url = 'https://mobilesystem.azurewebsites.net/gps_test_2/getTrack.php?artistid='+id;

        fetch(url, {
            method: 'GET'
        }).then((res) => {
            return res.json();
        }).then((json) => {
            resolve(json);
        });
    });
}

function initMap() {
    let mapLatLng = new google.maps.LatLng(latitude, longitude);
    
    let mapOptions = {
        zoom : 10,
        center : mapLatLng,
        gestureHandling: 'none',
        zoomControl: false,
        fullscreenControl: false
    };
    
    let map = new google.maps.Map(
        document.getElementById("map-canvas"),
        mapOptions,
    );
    
    let markerOptions = {
        map: map,
        position: mapLatLng,
        icon: {
            scaledSize: new google.maps.Size(100, 100)
        },
    };
    let marker = new google.maps.Marker(markerOptions);
}
