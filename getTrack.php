<?php
    const CLIENT_ID = '31acc302ac1049b188069b8f2dadde01';
    const CLIENT_SECRET = 'f7dd3871fc4246bcaed19a0d50b7ac1e';
    const REDIRECT_URI = 'http://localhost:8888/';
    
    $artistID = $_GET['artistid'];
    
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
	
	
    $url = 'https://api.spotify.com/v1/artists/'.$artistID.'/top-tracks?market=JP';
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
    $result = json_decode($html);
    curl_close($ch);
    
    $tracksObj = $result->tracks;
    $responseArray = array();
    
    for($i=0; $i<count($tracksObj); $i++){
        array_push($responseArray, [$tracksObj[$i]->name, $tracksObj[$i]->external_urls->spotify, $tracksObj[$i]->preview_url]);
    }
    
    print_r(json_encode($responseArray));
?>
