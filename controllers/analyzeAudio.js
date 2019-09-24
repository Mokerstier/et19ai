const DeepAffects = require("deep-affects");
const defaultClient = DeepAffects.ApiClient.instance;
const UserSecurity = defaultClient.authentications["UserSecurity"];
UserSecurity.apiKey = process.env.DEEP_AFFECTS_API_KEY;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//UserSecurity.apiKeyPrefix = 'Token';

const apiInstance = new DeepAffects.EmotionApi();
let body; // {Audio} Audio object
const fs = require("fs");

function onAnalyzeAudioPost(req, res) {
	let audioFile = req.body.audioFile;
	let base64Audio = audioFile.split(";base64,").pop();

	fs.writeFile("audioTest1.wav", base64Audio, { encoding: "base64" }, function(err) {
		console.log("File created");
		body = DeepAffects.Audio.fromFile("./audioTest1.wav");
	});
	console.log('analyzing file now...');
	res.redirect("/analyzedAudio");
}

function onAnalyzedAudio(req, res) {
	apiInstance.syncRecogniseEmotion(body, (error, data, response) => {
		if (error) {
			console.error(error);
		} else {
			console.log("API called successfully. Returned data: " + response);
			emoData = JSON.parse(response.text);
			res.send(emoData);
		}
	});
}

module.exports = { onAnalyzedAudio, onAnalyzeAudioPost };
