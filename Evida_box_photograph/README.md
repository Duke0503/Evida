## Introduction
A backend service:
  - Get statuses for each outlets of each boxes
  - Get a status when it changes. If not change, get status in every 1 hour.
  - When status of each outlet is 2, please record currents, voltage, power factor, power consumption
    - in every 30 minutes, or 
    - Current of each outlets changes more than 1 ampere or 
    - Power factor changes more than 10
    - Power consumption changes 1kw

## Install packages: 

```bash
$ npm install
```

## Running the app:

```bash
$ npm start
```