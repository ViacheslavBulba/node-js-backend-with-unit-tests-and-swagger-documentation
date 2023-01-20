const express = require('express');
const app = express();
const PORT = 1234;

const fs = require('fs')
const csv = require('fast-csv');
const data = []

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