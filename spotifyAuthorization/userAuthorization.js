/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const request = require("request"); // "Request" library
const querystring = require("querystring");
require("dotenv").config();

const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = "https://localhost:8443/test"; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

const stateKey = "spotify_auth_state";

function onLogin(req, res) {
	const state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	const scope = "user-read-private user-read-email";
	res.redirect(
		"https://accounts.spotify.com/authorize?" +
			querystring.stringify({
				response_type: "code",
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state
			})
	);
}

function onCallback(req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter

	const code = req.query.code || null;
	const state = req.query.state || null;
	const storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect(
			"/#" +
				querystring.stringify({
					error: "state_mismatch"
				})
		);
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: "https://accounts.spotify.com/api/token",
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: "authorization_code"
			},
			headers: {
				Authorization:
					"Basic " +
					new Buffer(client_id + ":" + client_secret).toString("base64")
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				var options = {
					url: "https://api.spotify.com/v1/me",
					headers: { Authorization: "Bearer " + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					console.log(body);
				});

				// we can also pass the token to the browser to make requests from there
				res.redirect(
					"/#" +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token
						})
				);
			} else {
				res.redirect(
					"/#" +
						querystring.stringify({
							error: "invalid_token"
						})
				);
			}
		});
	}
}

function onRefreshToken(req, res) {
	// requesting access token from refresh token
	const refresh_token = req.query.refresh_token;
	const authOptions = {
		url: "https://accounts.spotify.com/api/token",
		headers: {
			Authorization:
				"Basic " +
				new Buffer(client_id + ":" + client_secret).toString("base64")
		},
		form: {
			grant_type: "refresh_token",
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			const access_token = body.access_token;
			res.send({
				access_token: access_token
			});
		}
	});
}

module.exports = { onLogin, onCallback, onRefreshToken };
