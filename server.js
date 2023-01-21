const express = require('express');
const app = express();
const PORT = process.env.PORT || 1234;

const fs = require('fs')
const csv = require('fast-csv');
const data = []

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "My api example",
            description: "This is a sample server for a weather app",
            termsOfService: "http://example.com/terms/",
            contact: {
              name: "API Support",
              url: "http://www.example.com/support",
              email: "support@example.com"
            },
            license: {
              name: "Apache 2.0",
              url: "https://www.apache.org/licenses/LICENSE-2.0.html"
            },
            version: "1.0.1",
            server: ["https://localhost:1234"]
          }
    },
    apis: ["server.js"] // for more complex app it can be ['.routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

fs.createReadStream('./temperatures.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => data.push(row))
    .on('end', () => console.log(data));

app.use(express.json()); // middleware to work with json

app.listen(
    PORT,
    () => {
        console.log(`server started at http://localhost:${PORT}`);
    }
);

/**
 * @swagger
 * /weather/sydney:
 *  get:
 *   description: Returns all available days weather data for Sydney
 *   responses:
 *     '200':
 *       description: Array of objects {"Date":"2020-01-01","Max":"26.0","Min":"18.8"}
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 */
app.get('/weather/sydney', (req, res) => {
    res.status(200).send(data);
});

app.get('/weather/sydney/:date', (req, res) => {
    const { date } = req.params;
    const specificDateData = data.filter(a => a.Date === date);
    if (specificDateData.length === 0) {
        res.status(404).send({ message: 'no data for this date' });
    }
    res.status(200).send(specificDateData);

});

/**
 * @swagger
 * /weather/sydney/{date}:
 *  post:
 *   description: The Date you want to post data for (e.g. 2020-01-01)
 *   parameters:
 *        - name: date
 *          in: path
 *          schema:
 *            type: string
 *          description: Date in format of 2020-01-01
 *          required: true
 *          value: 1999-01-01
 *        - name: bodyJson
 *          in: body
 *          schema:
 *            type: object
 *          required: true
 *          value: '{"Date":"2020-01-01","Max":"26.0","Min":"18.8"}'
 *   responses:
 *     '202':
 *       description: Object {"Date":"2020-01-01","Max":"26.0","Min":"18.8"}
 *       content:
 *         application/json:
 *           schema:
 *             type: Object
 *     '400':
 *       description: Error Bad Request message "Body should contain Max,Min fields"
 *       content:
 *         application/json:
 *           schema:
 *             type: Object
 */
app.post('/weather/sydney/:date', (req, res) => {
    const { date } = req.params;
    const { Max, Min } = req.body;
    if (!Max || !Min) {
        res.status(400).send({ message: 'Body should contain Max,Min fields' });
    } else {
        const objectToSave = { Date: date, Max, Min };
        data.push(objectToSave);
        res.status(202).send(objectToSave);
    }
    
    // curl -i -X POST -H "Content-Type: application/json" -d "{ \"Max\": \"55.8\", \"Min\": \"1.8\" }" http://localhost:1234/weather/sydney/2023-01-16
    // curl -i -X POST -H "Content-Type: application/json" -d "{ \"max\": \"55.8\", \"Min\": \"1.8\" }" http://localhost:1234/weather/sydney/2023-01-17
});