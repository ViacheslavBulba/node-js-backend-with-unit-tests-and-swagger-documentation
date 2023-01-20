const request = require('request');
const moment = require('moment');

const date = moment().format('YYYY-MM-DD');

describe('GET /weather/sydney', () => {

    it('should return 200 ok', (done) => { // for async code you should pass (done) and call it later (see below)
        request.get('http://localhost:1234/weather/sydney', (err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
        })
    });

    it('should return not empty array', (done) => {
        request.get('http://localhost:1234/weather/sydney', (err, res) => {
            console.log(res.body);
            expect(JSON.parse(res.body).length).toBeGreaterThan(0);
            done();
        })
    });
});

describe('GET weather data for specific date', () => {

    it('should return 200 ok', (done) => {
        request.get('http://localhost:1234/weather/sydney/2020-01-10', (err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
        })
    });

    it('taken from csv', (done) => {
        request.get('http://localhost:1234/weather/sydney/2020-01-10', (err, res) => {
            console.log(res.body);
            expect(JSON.parse(res.body)[0].Date).toEqual('2020-01-10');
            expect(JSON.parse(res.body)[0].Max).toEqual('22.2');
            expect(JSON.parse(res.body)[0].Min).toEqual('13.6');
            done();
        })
    });

    it('sent by post request', (done) => {
        const max = '13.0';
        const min = '5.0';
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `http://localhost:1234/weather/sydney/${date}`,
            body: `{ \"Max\": \"${max}\", \"Min\": \"${min}\" }`
        }, function (error, response, body) {
            console.log(body);
        });
        request.get(`http://localhost:1234/weather/sydney/${date}`, (err, res) => {
            console.log(res.body);
            expect(JSON.parse(res.body)[0].Date).toEqual(date);
            expect(JSON.parse(res.body)[0].Max).toEqual(max);
            expect(JSON.parse(res.body)[0].Min).toEqual(min);
            done();
        })
    });
});

describe('POST weather data for specific date', () => {

    it('should return 400 and error message for wrong field names', (done) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `http://localhost:1234/weather/sydney/${date}`,
            body: `{ \"max\": \"4.3\", \"Min\": \"0.1\" }`
        }, function (error, res, body) {
            console.log(body);
            expect(res.statusCode).toEqual(400);
            expect(JSON.parse(body).message).toBe('Body should contain Max,Min fields');
            done();
        });
    });
});