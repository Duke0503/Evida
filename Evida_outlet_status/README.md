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

## Attributes of the Data
![Outlet_status](https://github.com/Duke0503/Evida/blob/main/Images/outlet_status.png?raw=true)

### Table Name: outlet_data

1. **id**
   - **Description**: The identifier of record in database.

2. **box_id**
   - **Description**: The identifier of the electrical box.

3. **box_status**
   - **Description**: The overall status of the electrical box. The possible values are:
     - online
     - offline
4. **outlet_number**
  - **Description**: The identifier of a specific outlet.

5. **outlet_status**
   - **Description**: The status of each outlet. The possible values and their meanings are:
     - `0`: OUTLET_AVAILABLE
     - `1`: OUTLET_READY
     - `2`: OUTLET_CHARGING
     - `3`: OUTLET_FULLCHARGE
     - `4`: OUTLET_UNPLUG
     - `6`: Outlet is not available
     - Other values (5, 7-12) might be defined as needed

6. **timestamp**
   - **Description**: The date and time when the data was recorded.

7. **current**
   - **Description**: Electrical current flowing through the outlet when the status is 2, in kiloAmpere (kA).

8. **voltage**
   - **Description**: Electrical voltage supplied by the ebox, in volt (V).
   
9. **outlet_power_factor**
   - **Description**: Electrical power is being converted and utilized by the electronic outlet when the status is 2 (%).

9. **outlet_outlet_outloutlet_power_consumptionumption**
   - **Description**: The power consumption measurement of the electrical outlet when the status is 2, in kilowatts (kW).

