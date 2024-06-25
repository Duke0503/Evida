## Introduction
A backend program:
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

1. **ebox_id**
   - **Description**: The identifier of the electrical box.
   - **Example**: `"Ebox_0001"`

2. **timestamp**
   - **Description**: The time and date when the data was recorded.
   - **Example**: `"08:53:54 25/06/2024"`

3. **outlet_id**
  - **Description**: The identifier of a specific outlet.
  - **Example**: `"0"`

4. **box_status**
   - **Description**: The overall status of the electrical box. The possible values are:
     - online
     - offline
   - **Example**: `online`

5. **outlet_status**
   - **Description**: The status of each outlet. The possible values and their meanings are:
     - `0`: OUTLET_AVAILABLE
     - `1`: OUTLET_READY
     - `2`: OUTLET_CHARGING
     - `3`: OUTLET_FULLCHARGE
     - `4`: OUTLET_UNPLUG
     - `6`: Outlet is not available
     - Other values (5, 7-12) might be defined as needed
   - **Example**: `2`

6. **current**
   - **Description**: Electrical current flowing through the outlet when the status is 2, in kiloAmpere (kA)
   - **Example**: `0.488`

7. **voltage**
   - **Description**: Electrical voltage supplied by the ebox, in volt (V)
   - **Example**: `230`
   
8. **power_factor**
   - **Description**: Electrical power is being converted and utilized by the electronic outlet when the status is 2 (%)
   - **Example**: `23`

9. **power_consumption**
   - **Description**: The power consumption measurement of the electrical outlet when the status is 2, in kilowatts (kW).
   - **Example**: `4795.257`

