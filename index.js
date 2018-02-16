// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const compose = require('lodash.compose')
const promisify = func => compose(Promise.resolve.bind(Promise), func)

module.exports = config => {
	const { messages='messages', chats='chats', members='members' } = config.paths || {}

	admin.initializeApp(Object.assign({}, functions.config().firebase, {
	  credential: admin.credential.cert(config.serviceAccount),
	}))


	// create an authentication endpoint.
	// calls our backend to validate JWT
	// if it passes, generate firebase token for the user
	const authenticate = functions.https.onRequest((req, res) => {
		const { method, query } = req
		if (method !== 'GET') 
			return res.status(405).end()

		const authPromise = promisify(config.authenticate) // in case it returns a non-promise

		return authPromise(query) 
			.then(({ uid, additionalClaims }) => admin.auth().createCustomToken(uid, additionalClaims))
			.then(token => res.status(200).send({ token }))
	})
	
	// listen for new messages and notify our backend
	const onNewMessage = functions.database.ref(`${messages}/{roomId}/{messageId}`)
    .onWrite(({ data, params }) => {
      const { roomId, messageId } = params
      const payload = data.val()

		  return Promise.all([
		    admin.database().ref(chats).child(roomId).set(payload),
				typeof config.onNewMessage === 'function' 
					&& config.onNewMessage(roomId, messageId, payload),
		  ])
    })

	return {
		authenticate,
		onNewMessage,
	}
}