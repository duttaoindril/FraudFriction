'use strict';
// Import Libraries
const readline = require('readline');
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const service = express();
// Enable Cors, just in case
service.use(cors());
// Create a simple home page redirect
service.use('/', express.static(path.join(__dirname, 'public')));
// Define Global Constants
const PORT = 8080;
// Constants to calculate distance from lat/longs
const p = 0.017453292519943295;
const c = Math.cos;
// Sample list of IPs marked fraud or unknown
let IPs = {
  '77.52.78.176': { status: 'login' },
  '113.28.68.110': { status: 'fraud' },
  '108.254.5.199': { status: 'login' },
  '83.180.223.75': { status: 'fraud' },
  '143.236.35.94': { status: 'login' },
  '177.27.179.81': { status: 'fraud' },
  '68.217.131.23': { status: 'login' },
  '130.236.74.18': { status: 'fraud' },
  '21.203.198.168': { status: 'login' },
  '112.95.247.246': { status: 'fraud' },
  '130.213.238.174': { status: 'login' }
};
// URL + access key to get lat/longs from IPs
const url = 'http://api.ipstack.com/';
const access_key = '3d6e296e58ac987ed8c19572e76c0d2d';
// Template literal to get request URL
const getURL = ip => `${url}/${ip}?access_key=${access_key}`;
// Fetch function to get lat/longs from IP
const getLocationData = async (ip, cb) => {
  try {
    const { data } = await axios.get(getURL(ip));
    cb(data);
  } catch (error) {
    console.error(error);
    cb({});
  }
};
// Helper Method to read file
const processFile = (inputFile, cb) => {
  let fileIPs = {};
  if (!fs.existsSync(inputFile)) {
    console.log(`Could not open file ${inputFile}.`);
    cb(null);
    return;
  }
  let instream = fs.createReadStream(inputFile);
  let outstream = new (require('stream'))();
  let rl = readline.createInterface(instream, outstream);
  rl.on(
    'line',
    line =>
      (fileIPs[line.split(' ')[1]] = {
        status: line.split(' ')[0].toLowerCase()
      })
  );
  rl.on('close', line => {
    cb(fileIPs);
    console.log('Done reading file', inputFile);
  });
};
// Helper method to get distance between 2 sets of Lat/Longs
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) =>
  12742 *
  Math.asin(
    Math.sqrt(
      0.5 -
        c((lat2 - lat1) * p) / 2 +
        (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2
    )
  );
// Helper method to turn Kilometers into Miles
const getMilesFromKm = km => km * 0.62137;
// Helper method to get if an object has a key
const has = (object, key) =>
  object ? hasOwnProperty.call(object, key) : false;
// Helper method to round a number to 2 decimal places
const roundToTwo = num => +(Math.round(num + 'e+2') + 'e-2');
// Helper method to check to see if a string is an IP
const checkIP = ip =>
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip
  );
// Helper method to get the query from URL
const getUrlParameter = (name, url) => {
  const results = new RegExp(
    '[\\?&]' + name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]') + '=([^&#]*)'
  ).exec(url);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
// Helper method to get the closest IP from list of IPs
const getClosestIP = (ip, cb) =>
  getLocationData(ip, ({ latitude, longitude }) => {
    let minDistanceIndexIP = 0;
    let minDistance = Number.POSITIVE_INFINITY;
    const ipList = Object.keys(IPs);
    for (let i = 0; i < ipList.length; i++) {
      let distance = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        IPs[ipList[i]].latitude,
        IPs[ipList[i]].longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceIndexIP = i;
      }
    }
    const score =
      getMilesFromKm(minDistance) *
      (IPs[ipList[minDistanceIndexIP]].status === 'fraud' ? 2 : 1);
    cb({
      minDistance,
      score,
      ip: ipList[minDistanceIndexIP],
      ...IPs[ipList[minDistanceIndexIP]]
    });
  });
// The Scoring API Call
service.get('/score', (req, res) => {
  const currentIP = getUrlParameter('ip', req.url);
  if (currentIP.length === 0) {
    res.send({ error: 'No IP Provided.' });
    return;
  }
  if (!checkIP(currentIP)) {
    res.send({ error: 'Invalid IP Provided.' });
    return;
  }
  getClosestIP(
    currentIP,
    ({ minDistance, score, ip, continent_name, country_name, status }) => {
      res.send({
        currentIP,
        closestIP: ip,
        closestIPStatus: status,
        score: roundToTwo(score),
        distanceInMiles: roundToTwo(getMilesFromKm(minDistance)),
        distanceInKm: roundToTwo(minDistance),
        closestIPContinent: continent_name,
        closestIPCountry: country_name
      });
    }
  );
});
// Read the file and save the list
processFile('./ips.txt', list => {
  IPs = list || IPs;
  console.log(IPs);
  // Quick for loop to get the location data for all the IPs, will start the server when finished
  const ipList = Object.keys(IPs);
  for (let i = 0; i < ipList.length; i++)
    getLocationData(ipList[i], data => {
      IPs[ipList[i]] = Object.assign(data, IPs[ipList[i]]);
      // When all the IPs have a location, then the server starts
      Object.values(IPs).every(
        x => has(x, 'latitude') && has(x, 'longitude')
      ) && run();
    });
});
// Starts listening to requests when all  IPs have been marked with a location
const run = () => {
  service.listen(PORT, () => {
    console.log(
      `Running on http://127.0.0.1:${PORT}; Visit to open the client.`
    );
  });
};
