# chatFireServerless
Serverless chat backend

## get started
```shell
# use the firebase cli to initialize a project
yarn global add firebase-tools

firebase init functions

# add chatFireServerless
cd functions
yarn add chatFireServerless
```
Then replace functions/index.js with this:
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
  //    .then(user => user.id)
  })
})
```



Then just
```shell
firebase deploy
```
## Description

// write more here

### todo
- [ ] Project description in Readme
- [ ] Enumerate configuration options in Readme
- [ ] Add database rules to deployment package
- [ ] Server examples (different configurations and permissions)
- [ ] Client examples
- [ ] Support sending attachments via cloud storage
- [ ] Typing indicators and whatnot
