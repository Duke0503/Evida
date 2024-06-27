## Introduction
A backend service that receives message from an MQTT Broker and save data to PostgreSQL every hour.

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

### Table Name: power_consumption

1. **id**
   - **Description**: The identifier of record in database.

2. **ebox_id**
   - **Description**: The identifier of the electrical box.

3. **outlet_0_status** to **outlet_9_status**
   - **Description**: The status of each outlet (0 to 9). The possible values and their meanings are:
     - `0`: OUTLET_AVAILABLE
     - `1`: OUTLET_READY
     - `2`: OUTLET_CHARGING
     - `3`: OUTLET_FULLCHARGE
     - `4`: OUTLET_UNPLUG
     - `6`: Outlet is not available
     - Other values (5, 7-12) might be defined as needed

4. **ebox_status**
   - **Description**: The overall status of the electrical box. The possible values are:
     - online
     - offline

5. **power_consumption**
   - **Description**: The power consumption measurement of the electrical box, in kilowatts (kW).

6. **PME_value**
   - **Description**: A specific measurement value related to the electrical box, possibly related to power management or another metric.

7. **timestamp**
   - **Description**: The date and time when the data was recorded.   




