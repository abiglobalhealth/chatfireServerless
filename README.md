# chatfireServerless
An ultra-simple chat backend built on Firebase and Firebase Cloud Functions.

### Quick start
```shell
# use the firebase cli to initialize a project
yarn global add firebase-tools

firebase init functions

# add chatFireServerless
cd functions
yarn add chatFireServerless
```
Then replace `functions/index.js` with this:
```js
const chatFireServerless = require('chatFireServerless')

const serviceAccount = require('./serviceAccount.json') // temporarily required
// You'll also need to download your serviceAccount file from google.
// This is because default credentials dont allow you to call `createCustomToken`.
// more here: https://stackoverflow.com/questions/42717540/firebase-cloud-functions-createcustomtoken

module.exports = chatFireServerless({
  serviceAccount, //temporarily required
  authenticate: payload => {
  //  do your authentication/authorization and return the users id. For example:
  //  return fetch('https://api.mybackend.com', payload)
  //    .then(user => ({ uid: user.id }))
  })
})
```



Then just
```shell
firebase deploy
```
### How it works
![untitled diagram 4](https://user-images.githubusercontent.com/1440796/36492404-594b4d3a-172d-11e8-902b-3f31caea28c9.png)
1. Clients call the authenticate endpoint with some payload containing user data, invoking your `authenticate` function
2. The endpoint generates and returns database credentials scoped to the paramaters returned by your `authenticate` function. This must include a `uid` and may also include custom claims (see below for more info).
3. The client uses these credentials to connect to your realtime database instance to read and write messages. Firebase will use the `uid` (and any custom claims) to determine which rooms the client can access, based on the database rules you apply.

### Base security rules
This are the minimum security rules you want in place:
```js
{
  "rules": {
    "messages": {
      "$roomId": {
        ".indexOn": [ "at" ], // index messages by timestamp
        ".read": true, // anyone can read messages from any chatroom
        "$messageId": {
          ".write": "!data.exists() && newData.exists()" // users can only write new messages, not modify existing messages
        },
      },
    },
    "chats": {
      ".indexOn": [ "at" ], // index on the timestamp of the last message in each room
      ".read": true, // anyone can read the list of chatrooms
      ".write" false // only the server can write here
    }
  }
}
```
The examples folder has more complex setups

### Advanced configuration
key  | required | description
--- | --- | ---
`serviceAccount` | temporarily | You must provide a `serviceAccount.json` file, available from your project's settings in the Firebase console.
`authenticate` | always | `function(query) { }` Must return an object `{ uid: 'user12345' }`. May also contain custom claims. e.g. `{ uid: 'user67890', additionalClaims: { admin: true } }` 
`onNewMessage` | |  `function(roomId, messageId, payload) { }` if you want to do something whenever a message is received.
`paths` | | Set custom path names. e.g. `{ messages: 'items', chats: 'rooms' }`



### todo
- [x] Project description in Readme
- [x] Enumerate configuration options in Readme
- [ ] Add database rules to deployment package
- [ ] Server examples (different configurations and permissions)
- [ ] Client examples
- [ ] Support sending attachments via cloud storage
- [ ] Typing indicators and whatnot
