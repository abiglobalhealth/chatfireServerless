// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const compose = require('lodash.compose')
const cors = require('cors')({ origin: true });

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
		cors(req, res, () => {
			const { method, query } = req

			if (method !== 'GET') 
				return res.status(405).end()

			const authPromise = promisify(config.authenticate) // in case it returns a non-promise

			authPromise(query) 
				.then(({ uid, additionalClaims }) => admin.auth().createCustomToken(uid, additionalClaims))
				.then(token => {
					res.set('Cache-Control', 'public, max-age=600, s-maxage=1800');
					res.status(200).send({ token })
				})
				.catch(e => res.status(e.status || 500).send(e))
    })
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

  const onAttachment = functions.storage.object().onChange(({ data }) => {
   	const { name, mediaLink, timeCreated } = data
   	const userId = name.split('/')[1]
   	const at = new Date(timeCreated).getTime()

   	return admin.database().ref(messages).child(userId).child(at).set({
   		userId,
   		at,
   		attachments: [{
   			path: name,
   			url: mediaLink,
   		}],
   	})
  })

	return {
		authenticate,
		onNewMessage,
		onAttachment,
	}
}