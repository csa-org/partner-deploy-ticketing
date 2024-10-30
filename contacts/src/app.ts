import express from 'express';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import * as Contacts from "./controllers"
import morgan from 'morgan';
import cors from 'cors';

process.on('SIGINT', function () {
	process.exit();
});

function setupMongoConnection() {
	const dbUrl = process.env["MONGODB_CONN_STRING"]
	if (!dbUrl) {
		console.log("must set MONGODB_CONN_STRING")
		process.exit();
	}
	const dbUser = process.env["MONGODB_USER"]
	if (!dbUser) {
		console.log("must set MONGODB_USER")
		process.exit();
	}
	const dbPass = process.env["MONGODB_PASS"]
	if (!dbPass) {
		console.log("must set MONGODB_PASS")
		process.exit();
	}

	mongoose.connect(dbUrl, { user: dbUser, pass: dbPass, connectTimeoutMS: 1000 }).then(() => {
		console.log("Successfully connected to the database");
	}).catch(err => {
		console.log('Could not connect to the database. Exiting now...', err);
		process.exit();
	});

}

function createRoutes(app: express.Express) {
	const urlencodedParser = bodyParser.urlencoded({ extended: false })
	app.post('/contacts', urlencodedParser, Contacts.create);
	app.delete('/contacts/:contactId', Contacts.deleteOne);
	app.put('/contacts/:contactId', Contacts.updateOne);
	app.get('/contacts', Contacts.findAll);
	app.get('/contacts/:email', Contacts.findOne);
}

function createApp() {
	const app = express();
	app.use(cors({ origin: "*" }))
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())
	app.use(morgan('combined'))
	createRoutes(app)
	return app
}

// start
setupMongoConnection()
const app = createApp()
const port = process.env.PORT || 9001
console.log(`Server running at http://localhost:${port}`);
app.listen(port);
