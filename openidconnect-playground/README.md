# OpenID Connect Playground

Uses Express, React.

## Environment:

If running locally, create a `.env` file with these values:
```
JWT_SECRET=y0ur_secret
PORT=3000
REDIRECT_URI=http://localhost:3000/callback
CLIENT_ID=(client_id from a client in your tenant)
CLIENT_SECRET=(client_secret from a client in your tenant)
NON_SECURE_SESSION=true
```

## To build:

```
npm run build
```

## To run:

```
node index.js
```

[http://localhost:3000](http://localhost:3000)

## Dev:

Terminal 1 (backend):
```
npm start
```

Terminal 2 (frontend):
```
npm run watch
```

[http://localhost:3000](http://localhost:3000)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
