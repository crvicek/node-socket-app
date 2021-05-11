# Node socket app

This is a simple app that provides a websocket and a rest endpoint.


______________________________________________________
## Socket

Socket connection is available on [ws://localhost:3000/socket](ws://localhost:3000/socket) and accepts one key:value stringified JSON objects as the one below:

```json
{
    "key": "value"
}
```

Strings, multiple key:value objects and arrays are not accepted.
Correctly formated pairs are saved to redis and available at the rest endpoint


## Rest

Rest endpoint is available on [http://localhost:3000/rest/:key](http://localhost:3000/rest/:key). For keys provided by websocket the corresponding value is returned, for non existing keys error is returned.

## Requirements
Project requires [redis](https://redis.io/) to persist the keys

______________________________________________________
## Installation & start
Once you downloaded the project from git you can either:
### Option 1
- Install manually by `npm i`
- Run tests `npm run test`
- Start the app `npm run start`
### Option 2
- Or you can run `start.sh` from the command line (it will pull and restart redis)

