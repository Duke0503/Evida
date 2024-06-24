# System Overview Documentation
![Overview](https://github.com/Duke0503/Evida/blob/main/Images/system_overview.png?raw=true)
## Introduction
This document provides a detailed description of the system architecture illustrated in the overview diagram. The system is designed to handle and analyze messages from multiple EBoxes, process them through a backend program, store data in MongoDB and SQL databases, and visualize the results using Grafana dashboards.

## Components

### 1. EBox
- **Description**: EBox devices are the source of the messages. They collect data and send it to the MQTT Broker.
- **Function**: Each EBox generates and transmits messages containing relevant data to the MQTT Broker.

### 2. MQTT Broker
- **Description**: The MQTT Broker is a central component that handles the transmission of messages from the EBox devices to the subscriber.
- **Function**: 
  - Receives messages from multiple EBox devices.
  - Forwards messages to the subscriber (Backend Program).

### 3. Backend Program (Subscriber)
- **Description**: The Backend Program subscribes to the MQTT Broker to receive messages from the EBoxes.
- **Function**: 
  - Subscribes to the MQTT Broker.
  - Processes incoming messages and saves them to MongoDB.
  - Extracts data from MongoDB and sends it to the SQL Database.

### 4. MongoDB
- **Description**: MongoDB is a NoSQL database used to store the raw messages received from the EBoxes.
- **Function**: 
  - Stores incoming messages from the Backend Program.
  - Acts as an intermediary data storage before data processing and analysis.

### 5. SQL Database
- **Description**: The SQL Database is used for storing processed and analyzed data.
- **Tables**:
  - **Outlet_analysis table**: Stores analysis results related to outlet usage.
  - **Charging_event_daily table**: Contains daily summaries of charging events.
  - **Box_analysis table**: Stores analysis results related to individual EBoxes.
  - **Charging_event_monthly table**: Contains monthly summaries of charging events.
- **Function**:
  - Receives processed data from MongoDB.
  - Provides structured storage for analysis results which are then used for visualization.

### 6. Dashboard (Grafana)
- **Description**: Grafana is a visualization tool used to create interactive and informative dashboards based on the data stored in the SQL Database.
- **Function**:
  - Connects to the SQL Database to retrieve data.
  - Displays data in various visual formats for easy analysis and monitoring.
  - Provides insights through dashboards using data from the Outlet_analysis, Charging_event_daily, Box_analysis, and Charging_event_monthly tables.

## Data Flow

1. **Message Generation**: EBox devices generate and send messages containing data.
2. **Message Transmission**: Messages from EBox devices are sent to the MQTT Broker.
3. **Message Reception**: The MQTT Broker forwards these messages to the Backend Program.
4. **Data Storage in MongoDB**: The Backend Program processes the messages and saves them to MongoDB.
5. **Data Processing and Transfer**: The Backend Program extracts data from MongoDB, processes it, and sends it to the SQL Database.
6. **Data Storage in SQL Database**: Processed data is stored in various tables in the SQL Database.
7. **Data Visualization**: Grafana retrieves data from the SQL Database and displays it in dashboards for analysis.

## Conclusion
This document provides an overview of the system architecture, detailing each component's role and the data flow within the system. By following this structure, users can understand how data is collected, processed, stored, and visualized, enabling effective monitoring and analysis of the EBox-generated data.
