## Introduction
A backend program that fetches data from an MQTT server and pushes to MongoDB every hour.

## Install packages: 

```bash
$ npm install
```

## Running the app:

```bash
$ npm start
```

## Attributes of the Data
![Power_consumption](https://github.com/Duke0503/Evida/blob/main/Images/power_consumption.png?raw=true)

1. **ebox_id**
   - **Description**: The identifier of the electrical box.
   - **Example**: `"Ebox_0001"`

2. **timestamp**
   - **Description**: The time and date when the data was recorded.
   - **Example**: `"10:00:02 25/06/2024"`

3. **outlet_0_status** to **outlet_9_status**
   - **Description**: The status of each outlet (0 to 9). The possible values and their meanings are:
     - `0`: OUTLET_AVAILABLE
     - `1`: OUTLET_READY
     - `2`: OUTLET_CHARGING
     - `3`: OUTLET_FULLCHARGE
     - `4`: OUTLET_UNPLUG
     - `6`: Outlet is not available
     - Other values (5, 7-12) might be defined as needed
   - **Example**: `0`

4. **ebox_status**
   - **Description**: The overall status of the electrical box. The possible values are:
     - `0`: Online
     - `5`: Offline
   - **Example**: `5`

5. **power_consumption**
   - **Description**: The power consumption measurement of the electrical box, in kilowatts (kW).
   - **Example**: `65.06837833333333`

6. **PME_value**
   - **Description**: A specific measurement value related to the electrical box, possibly related to power management or another metric.
   - **Example**: `0`


