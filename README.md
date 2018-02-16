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

module.exports = chatFireServerless({
	serviceAccount: require('./serviceAccount.json'), //temporarily required
  authenticate: payload => {
  //  do your authentication/authorization and return the users id.
  //  for example:
    return fetch('https://api.mybackend.com', payload)
      .then(user => user.id)
  })
})
```

_Temporary: You'll also need to download your serviceAccount file from google.
This is because default credentials dont allow you to call `createCustomToken`.
[more here](https://stackoverflow.com/questions/42717540/firebase-cloud-functions-createcustomtoken)_

Then just
```shell
firebase deploy
```
## Description

// write more here

### todo
- [ ] Project description in Readme
- [ ] Add database rules to deployment package
- [ ] Server examples (different configurations and permissions)
- [ ] Client examples
- [ ] Support sending attachments via cloud storage
- [ ] Typing indicators and whatnot
