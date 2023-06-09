<?php
    const CLIENT_ID = '';
    const CLIENT_SECRET = '';
    const REDIRECT_URI = '';
    
    $artist = $_GET['artist'];
    
    $id_secret = base64_encode(CLIENT_ID.':'.CLIENT_SECRET);
    
	$url = 'https://accounts.spotify.com/api/token';
    $headers = array(
        'Authorization: Basic '.$id_secret
    );
     
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $html = curl_exec($ch);
    $result = json_decode($html);
    curl_close($ch);
    
    $accessToken = trim($result->access_token, '"');
    
    $url = 'https://api.spotify.com/v1/search?q='.urlencode($artist).'&type=artist';
    $headers = array(
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Bearer '.$accessToken,
        'Accept-Language: ja'
    );
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $html = curl_exec($ch);
    curl_close($ch);
    $result = json_decode($html);
    
    $artistsArray = array();
    for($i=0; $i<count($result->artists->items); $i++){
        $artistInfo = $result->artists->items[$i];
        
        if($artist == trim($artistInfo->name, '"')){
            array_push($artistsArray, $artistInfo->popularity);
        }
    }    
    
    $artistInfo = $result->artists->items[array_keys($artistsArray, max($artistsArray))[0]];    
    print_r(json_encode($artistInfo));
?>
