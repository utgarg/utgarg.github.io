	• Set .env to following:
		JWT_SECRET=<y0ur_secret>
		PORT=3000
		REDIRECT_URI=http://localhost:3000/callback
		CLIENT_ID=<your-client-id>
		CLIENT_SECRET=<your-client-secret>
		NON_SECURE_SESSION=true

**Build instructions**

Run following commands in order:
	• npm run build  (to Build)
	• npm start (For backend)
	• npm run watch (For frontend)
	• PORT=5000 npx serve (For device flow)

Start the demo by hitting following url in your preferred web-browser: http://localhost:5000/
 - Navigate to openid-flow at http://localhost:3000/
 - Navigate to device flow at http://localhost:5000/device
