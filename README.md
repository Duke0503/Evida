# System Overview Documentation
![Overview](https://github.com/Duke0503/Evida/blob/main/Images/system_overview.png?raw=true)
## Introduction
This document provides a detailed description of the system architecture illustrated in the overview diagram. The system is designed to handle and analyze messages from multiple EBoxes, process them through various backend services, store data in local and cloud databases, and visualize the results using Grafana dashboards.

## Components

### 1. EBox
- **Description**: EBox devices are the source of the messages. They collect data and send it to the MQTT Broker.
- **Function**: Each EBox generates and transmits messages containing relevant data to the MQTT Broker.

### 2. MQTT Broker
- **Description**: The MQTT Broker is a central component that handles the transmission of messages from the EBox devices to the subscribers.
- **Function**: 
  - Receives messages from multiple EBox devices.
  - Forwards messages to the subscribers (Service 1 and Service 2).

### 3. Service 1: Cron and Analyze Data
- **Description**: This service runs at specified intervals (e.g., every hour) to fetch data from the Eboost database and the local database.
- **Function**: 
  - Fetches data from Eboost database and local database.
  - Processes the data to answer specific queries using SQL statements.
  - Pushes processed data to the local database for further analysis and visualization.

### 4. Service 2: Box Utilization Collection
- **Description**: This service is responsible for collecting utilization data from the MQTT Broker.
- **Function**:
  - Fetches an API to get all boxes and subscribes to all topics to receive messages.
  - Handles incoming messages and pushes consumption and PME data to the local database.
  - Schedules tasks to run every hour to ensure up-to-date data collection.

### 5. Service 3: Box Photograph
- **Description**: This service tracks the status of each outlet in the EBoxes and records relevant electrical parameters from MQTT Broker.
- **Function**:
  - Fetches an API to get all boxes and subscribes to all topics to receive messages.
  - Tracks the statuses for each outlet of each box and records changes.
  - When the status of an outlet is 2 (charging), records current, voltage, power factor, and power consumption every 30 minutes, or when significant changes are detected.
  - Stores recorded data in the local database.

### 6. Service 4: Backup Data
- **Description**: This service ensures data is backed up to the cloud at specified intervals (e.g., midnight every day).
- **Function**:
  - Ensures data is not duplicated or lost during the backup process.
  - Sends data from the local database to the cloud for secure storage.

### 7. Local Database
- **Description**: The local database stores all processed and collected data from various services.
- **Tables**:
  - **CHARGING_BOX_ANALYSIS**
  - **LOYAL_CUSTOMERS**
  - **CHARGING_EVENT_DAY**
  - **CHARGING_EVENT_WEEK**
- **Function**:
  - Organizes data into structured tables for analysis and visualization.
  - Stores processed data for use by Grafana and other reporting tools.

### 8. Grafana Dashboard
- **Description**: Grafana is a visualization tool used to create interactive and informative dashboards based on the data stored in the local database.
- **Function**:
  - Connects to the local database to retrieve data.
  - Displays data in various visual formats for easy analysis and monitoring.
  - Provides insights through dashboards using data from the local database tables.

## Data Flow

1. **Message Generation (EBox Devices)**:
   - Each EBox device generates and sends messages containing relevant data to the MQTT Broker.
   
2. **Message Transmission (MQTT Broker)**:
   - The MQTT Broker receives messages from multiple EBox devices.
   - The broker then forwards these messages to the appropriate backend services.

3. **Service 2: Box Utilization Collection**:
   - This service fetches an API to get all boxes and subscribes to all topics to receive messages.
   - It handles incoming messages and pushes consumption and PME data to the local database.
   - Tasks are scheduled to run every hour to ensure up-to-date data collection.

4. **Service 3: Box Photograph**:
   - This service fetches an API to get all boxes and subscribes to all topics to receive messages.
   - It tracks the statuses for each outlet of each box and records changes.
   - When the status of an outlet is 2 (charging), it records current, voltage, power factor, and power consumption every 30 minutes, or when significant changes are detected.
   - Data is stored in the local database.

5. **Service 1: Cron and Analyze Data**:
   - This service runs at specified intervals (e.g., every hour) to fetch data from the Eboost database and the local database.
   - It processes the data to answer specific queries using SQL statements.
   - Processed data is then pushed back to the local database for further analysis and visualization.

6. **Data Storage in Local Database**:
   - The local database stores all processed and collected data from various services.
   - Data is organized into tables such as CHARGING_BOX_ANALYSIS, LOYAL_CUSTOMERS, CHARGING_EVENT_DAY, and CHARGING_EVENT_WEEK for structured storage.

7. **Service 4: Backup Data**:
   - This service ensures data is backed up to the cloud at specified intervals (e.g., midnight every day).
   - It ensures that data is not duplicated or lost during the backup process.

8. **Data Visualization (Grafana)**:
   - Grafana connects to the local database to retrieve data.
   - It displays data in various visual formats for easy analysis and monitoring.
   - Users can create interactive dashboards using data from the local database tables.

9. **Reporting and Analysis**:
   - Data stored in the local database is used to generate reports and perform detailed analysis.
   - This data helps in understanding box utilization, charging patterns, and customer behavior.
## Conclusion
This document provides an overview of the system architecture, detailing each component's role and the data flow within the system. By following this structure, users can understand how data is collected, processed, stored, and visualized, enabling effective monitoring and analysis of the EBox-generated data and other related data.
