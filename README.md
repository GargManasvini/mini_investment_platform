# Mini Investment Platform - Grip Invest Winter Internship

## 

This repository contains the full-stack project for the Grip Invest Winter Internship selection process. It is a mini investment platform featuring a secure backend API, a modern React frontend, and a fully containerized deployment setup with Docker.

> **For detailed information about features, API endpoints, AI usage and other details please see the** [**full technical documentation**](./DOCUMENTATION.md "null")**.**

##  Tech Stack


*   **Frontend**: React.js, React Router, Tailwind CSS
    
*   **Backend**: Node.js, Express.js
    
*   **Database**: MySQL 8.0
    
*   **Containerization**: Docker, Docker Compose
    
*   **Testing**: Jest, Supertest
    

##  Getting Started

### Prerequisites

## 

Make sure you have **Docker Desktop** installed and running on your system.

### Running the Application

## 

The entire application stack (frontend, backend, database) is containerized and can be launched with a single command.

1.  **Clone the repository:**
    
        git clone https://github.com/GargManasvini/gripinvest_winter_internship_backend.git
        cd gripinvest_winter_internship_backend
        
    
2. **Configure Your Environment** :
This project uses an .env file to manage secret keys and configuration. An example template is provided. After creating the file, open the new .env file and fill in your local values (like a database password and a JWT secret).

        # Create your own environment file by copying the example
        cp .env.example .env


        
    
3.  **Run Docker Compose:** From the root directory of the project, run the following command. This will build the images and start all the services.


    
        docker-compose up --build
        
    
4.  **Access the Application:**
    
    *   **Frontend**: Open your browser and navigate to `http://localhost:5173`
        
    *   **Backend Health Check**: You can check the backend status at `http://localhost:5000/health`
        

The application is now fully running. The database will persist its data in the `mysql_data` folder.