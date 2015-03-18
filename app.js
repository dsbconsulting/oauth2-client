var express = require('express'),
    app = express(),
    request = require('request');

var oauth2 = require('simple-oauth2')({
    clientID: '3f48cabe-51f6-463d-94e4-dcda0cf35454',
    clientSecret: '7a0c9278-2487-422e-9d21-8afbeca87de8',
    site: 'http://localhost:3000',
    tokenPath: '/oauth/token'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
    redirect_uri: 'http://localhost:3001/callback',
    grant_type: 'authorization_code',
    response_type: 'code'
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization code and asking for the access token
app.get('/callback', function (req, res) {
    var code = req.query.code;
    console.log('/callback', code);

    if(req.query.error){
        res.send('ERROR: ' + req.query.error_description);
    }

    oauth2.authCode.getToken({
        code: code,
        redirect_uri: 'http://localhost:3001/callback'
    }, saveToken);

    function saveToken(error, result) {
        if (error) {
            console.log('Access Token Error', error);
            res.send('Error: ' + error.error_description);
            return;
        }
        console.log('Token: ', result);

        result.expires_in = 2592000; // 30 days in seconds
        var token = oauth2.accessToken.create(result);

        //Get User Object from token
        request.get(
            'http://localhost:3000/oauth/user',
            {
                'auth': {
                    'bearer': result.access_token
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("oauth USER RESPONSE: " + body);

                    res.send('User: <pre>' + body + '</pre>');
                }
                else{
                    console.log("oauth USER error: " + error);
                    res.send('Token created but could not get user');
                }
            }
        );

    }
});

app.get('/', function (req, res) {
    res.send('Hello, I am an awesome oauth2 client.<br><a href="/auth">Log in with AsperaID</a>');
});

app.listen(3001);

console.log('Express server started on port 3001');