# Technical Documentation - Mini Investment Platform

# 

This document provides a detailed breakdown of the project's features, AI integrations, API endpoints, and known limitations.

##  Key Features

### Backend
 

*    **JWT Authentication**: Secure user signup, login, and password reset flow.
    
*    **Admin Role Management**: Admin-only endpoints for managing investment products.
    
*    **Investment Logic**: Core APIs for managing user wallets, making investments, and fetching detailed portfolios.
    
*    **Automated Transaction Logger**: Middleware that automatically logs every API call for auditing and debugging.
    
*    **Intelligent Automations**: Rule-based logic to automate tasks and provide smart feedback.
    
*    **Health Check Endpoint**: A `/health` endpoint to monitor service and database status.
    
*    **Unit & Integration Tests**: Jest tests to ensure API reliability and correctness.
    

### Frontend

*    **React & Vite**: A fast, modern, and responsive single-page application.
    
*    **Tailwind CSS**: A utility-first CSS framework for clean and professional UI design.
    
*    **Protected Routes**: Client-side logic to protect user-only pages like the Dashboard and Wallet.
    
*    **Data Visualization**: Clear presentation of portfolio data with summary cards and visuals.
    
*    **Fully Responsive**: The user interface is optimized for a seamless experience on desktop, tablet, and mobile devices.

##  Database Schema & Seeding

The complete SQL schema for creating all necessary tables can be found in the `backend/sql/schema.sql` file.

For development and testing, a set of dummy investment products can be seeded into the database by running the script located at `backend/sql/seed_products.sql`.
    

##  Admin Functionality


Product management (Create, Update, Delete) is handled via secure, admin-only API endpoints. An admin would use an API client like Postman or Thunder Client to perform these actions.

*   **Admin User**: To create an admin, ensure their email is listed in the `ADMINS` environment variable in the `docker-compose.yml` file.
    
*   **Example: Creating a Product**:
    
    1.  Log in as the admin user to get a JWT token.
        
    2.  Send a `POST` request to `http://localhost:5000/products` with the token in the `Authorization: Bearer <token>` header and a JSON body like the following:
        
            {
              "name": "New Corporate Bond",
              "investment_type": "bond",
              "tenure_months": 48,
              "annual_yield": "9.50",
              "risk_level": "low"
            }
            
        

##  Fulfilling the "AI Integration" Requirement


The project was approached in two ways to meet the brief's guidelines on AI usage:

1.  **Leveraging AI as a Development Tool**: I strategically employed an AI assistant as a development co-pilot to enhance productivity. This involved using the AI for tasks such as generating boilerplate code, debugging complex issues, and rapidly prototyping UI components. This approach allowed me to focus more on the high-level architecture, business logic, and overall project strategy, while the AI handled more repetitive coding tasks.
    
2.  **Building Intelligent Automations**: The project brief required several AI-powered features. To fulfill these requirements in a practical and efficient manner, I developed a series of **intelligent automations** that use robust, rule-based logic to perform tasks that would normally require human thought. This approach is fast, reliable, and demonstrates the ability to build the required end-to-end functionality. The implemented features are:
    
    *   **Real-time Password Analysis**: Provides actionable feedback to users on the signup page to improve their security.
        
    *   **Automated Product Description Generation**: Creates consistent and professional descriptions for new investment products based on their attributes.
        
    *   **Automated Portfolio Analysis**: Analyzes a user's investment distribution and provides personalized insights by comparing it to their stated risk appetite.
        

##  Limitations & Future Improvements

This project was built to meet the core requirements of the internship assignment. The following are known limitations and potential areas for future enhancement:

*   **UI State Synchronization**: There is a minor visual inconsistency where the navbar may not immediately reflect the user's login status upon redirection. A future improvement would be to implement a global state management solution (like Redux Toolkit or Zustand) to ensure all components are perfectly synchronized with the authentication state.
    
*   **Dedicated Admin Interface**: While the backend provides secure CRUD operations for administrators, the project currently relies on an API client for product management. A significant future enhancement would be to build a dedicated, password-protected admin dashboard within the frontend application.
    
*   **True AI Integration**: The current intelligent features are implemented as simulations using rule-based logic. A powerful next step would be to replace these simulations with calls to actual Large Language Models (LLMs) via their APIs to provide more dynamic and nuanced feedback, descriptions, and portfolio insights.
    

##  API Endpoints Summary


A Postman collection containing all API requests is included in the root of this repository (`GripInvest.postman_collection.json`).

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| POST | /auth/signup | No | Register a new user. |
| POST | /auth/login | No | Log in and receive a JWT. |
| POST | /auth/reset-request | No | request to change user password and generates a otp in the console. |
| POST | /auth/reset | No | changes the password after veryfying the otp |
| GET | /products | No | Fetch a list of all investment products. |
| POST | /products | Admin | Create a new product with an auto-generated description. |
| PUT | /products/:id | Admin | Update an existing product. |
| DELETE | /products/:id | Admin | Delete a product. |
| GET | /invest/wallet | User | Get the user's current wallet balance. |
| POST | /invest/wallet/deposit | User | Deposit funds into the wallet. |
| POST | /invest | User | Make an investment in a product. |
| GET | /invest/portfolio | User | Fetch the user's detailed investment portfolio. |
| GET | /invest/portfolio/insights | User | Get a risk analysis of the portfolio. |
| GET | /profile | User | Get the user's profile information. |
| PUT | /profile | User | Update the user's risk appetite. |
| GET | /logs | User | Fetch the user's transaction activity log. |
| GET | /health | No | Check the health of the server and database. |