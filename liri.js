/*
----commands 
* `my-tweets`
	* This will show your last 20 tweets and when 
	they were created at in your terminal/bash window.

* `spotify-this-song`
	* This will show the following information about the
	 song in your terminal/bash window
    * Artist(s)
    * The song's name
    * A preview link of the song from Spotify
    * The album that the song is from

	* if no song is provided then your program will default to
    * "The Sign" by Ace of Base

* `movie-this`
	* This will output the following information to your terminal/bash window:

    * Title of the movie.
    * Year the movie came out.
    * IMDB Rating of the movie.
    * Country where the movie was produced.
    * Language of the movie.
    * Plot of the movie.
    * Actors in the movie.
    * Rotten Tomatoes Rating.
    * Rotten Tomatoes URL.

	* If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
    * If you haven't watched "Mr. Nobody," then you should: http://www.imdb.com/title/tt0485947/
    * It's on Netflix!

* `do-what-it-says`
	Using the fs Node package, 
	LIRI will take the text inside of random.txt 
	and then use it to call one of LIRI's commands.
	It should run spotify-this-song 
	for "I Want it That Way," as follows the text in random.txt.
	Feel free to change the text in 
	that document to test out the feature for other commands.

*	'Bonus'
	BONUS

	In addition to logging the data to your terminal/bash window, output the data to a .txt file called log.txt.
	Make sure you append each command you run to the log.txt file.
	Do not overwrite your file each time you run a command.
*/

'use strict'; 

//constants 
const fs = require('fs'); 
const request = require('request'); 
const keys = require('./keys.js'); 
const twitterKeys = keys.twitterKeys; 
//decided to use oauth over twitter request to try it out. 
const OAuth = require('oauth');
const screenName = '010josh010';
const spotify = require('spotify'); 

//input from arguments
var input = process.argv; 
//specifies what action to perform 
var command = input[2]; 
//specifies the title of the song or movie 
var title= input[3];


//LIRI object to contain the apps methods 
var LIRI = {

    getTweets:function(){

    //oauth request
    var oauth = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      twitterKeys.consumer_key,
      twitterKeys.consumer_secret,
      '1.0',
      null,
      'HMAC-SHA1'
    );

    //oauth get 
     oauth.get(
        'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name='+screenName+'&count=20',
        twitterKeys.access_token_key, //test user token 
        twitterKeys.access_token_secret, //test user secret             
        function (err, data, res){
          var log = []; 
          if (err) console.error(err);
          //parsed string output
          var parsed = JSON.parse(data); 

          //prints tweets to the console
          var tweets = parsed.filter(function(tweet){ 
            console.log('Tweet: '+ tweet['text']);
            log.push(tweet['text']); 
            console.log('Created at: '+ tweet['created_at']);
            log.push(tweet['created_at']); 
            console.log('----------------------------------------');

          })  
          //logs data to log.txt
          LIRI.logData(log.join(',')+'\n'); 
        }); 


  },

    //spotify api request
  spotifySearch:function(song){

    //if the song is undefined the the song will equal 'The Sign'
    if(!song){
      song = 'The,Sign'; 
    }

    //spotify api request by trackname 
    spotify.search({ type: 'track', query: song }, function(err, data) {
        if(err)console.error('Error occurred: ' + err);
        var log = []; 
        //collection of data returned from the http request
        var list = data.tracks.items; 

        //specifys what to log when iterating over the collection 
        var selection = function(collection){
          console.log('Artist: '+ collection.artists[0].name);
          log.push('Artist: '+ collection.artists[0].name+'\n'); 
          console.log('Song Name: '+ collection.name);
          log.push('Song Name: '+ collection.name+'\n');
          console.log('Preview Url: '+ collection.preview_url);
          log.push('Preview Url: '+ collection.preview_url+'\n');
          console.log('Album: '+ collection.album.name);
          log.push('Album: '+ collection.album.name+'\n'); 
          console.log('--------------------------------------'); 
          log.push('--------------------------------------'); 
        }

        //filters the collection to only items containing the specified properties and logs the appropriate data
         list.filter(selection); 

         //logs data to log.txt 
         LIRI.logData(log.join(',')+'\n');

    });

  },
  //IMDB request
  movieSearch:function(movieName){ 

      //if the movieName is undefined then the movie will be Mr Nobody
      if(!movieName){
        movieName = 'Mr Nobody'; 
      }

      //request to the omdbapi with the movie name 
      request('http://www.omdbapi.com/?t='+movieName+'&y=&plot=full&r=json', function (err, res, data) {
        //if request dosen't return an error and the statuscode is 200 
      if (!err && res.statusCode == 200) {
        var log = []; 
        var movie = JSON.parse(data);
        console.log('-----------------------------------------------') 
        log.push('-----------------------------------------------'); 
        console.log('Title: '+movie.Title); 
        log.push('Title: '+movie.Title +'\n'); 
        console.log('Year: '+movie.Year); 
        log.push('Year: '+movie.Year+'\n'); 
        console.log('IMDB Rating: '+movie.imdbRating); 
        log.push('IMDB Rating: '+movie.imdbRating +'\n');
        console.log('Country: '+movie.Country); 
        log.push('Country: '+movie.Country+'\n'); 
        console.log('Language: '+movie.Language); 
        log.push('Language: '+movie.Language+'\n');
        console.log('Plot: '+movie.Plot);
        log.push('Plot: '+movie.Plot+'\n');
        console.log('Actors: '+movie.Actors);
        log.push('Actors: '+movie.Actors+'\n'); 
        console.log('Metascore: '+movie.Metascore); 
        log.push('Metascore: '+movie.Metascore+'\n'); 
        console.log('Poster: ' + movie.Poster); 
        log.push('Poster: ' + movie.Poster+'\n'); 
        console.log('-----------------------------------------------')
        log.push('-----------------------------------------------'); 

        //logs data to log.txt 
        LIRI.logData(log.join(',')+'\n');
      }
    })
  },
  //random method that looks inside of random.txt and runs the command
  random:function(){
        fs.readFile('random.txt', 'utf-8', (err, data) => {
        if(err)console.error(err); 

        var list = data.split(',');
        var command = list[0].toString(); 
        var title = list[1]; 

        //switch statement to process the command from the text
        switch(command){
        case 'my-tweets':
          LIRI.getTweets(); 
          break; 
        case 'spotify-this-song':
          LIRI.spotifySearch(title); 
          break;
        case 'movie-this':
          LIRI.movieSearch(title); 
          break; 
        case 'do-what-it-says':
          LIRI.random(); 
          break; 
        default:
          console.log('input is not valid'); 
          break; 
      }
        
       
    }) 
  },
  //appends data to the log.txt file 
  logData:function(data){
      fs.appendFile('log.txt', data, (error)=>{
      
      if(error){
        console.log('there was an error'); 
      }
      else{
        console.log('file was updataed'); 
      }
    })
  }
}

//controls  
switch(command){
  case 'my-tweets':
    LIRI.getTweets(); 
    break; 
  case 'spotify-this-song':
    LIRI.spotifySearch(title); 
    break;
  case 'movie-this':
    LIRI.movieSearch(title); 
    break; 
  case 'do-what-it-says':
    LIRI.random(); 
    break; 
  default:
    console.log('input is not valid'); 
    break; 
}










