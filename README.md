## File Uploading and Short URL Generating Service

This is the README for the backend application of a file uploading and short url generating service. This backend application is responsible for handling API requests, authentication, file uploads, and other server-side functionality.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Authentication](#authentication)
- [Deployment](#deployment)

## Technologies Used

List the technologies and libraries used in your backend application:

- Node.js
- Express.js
- MongoDB (for database)
- AWS S3 (for file storage and pre signed url)
- bcrypt (for password hashing)
- multer (for file uploads)
- tinyurl (for short url)

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) 
- AWS S3 Bucket 

### Installation

1. Clone this repository: git clone https://github.com/varunc10/fileURL.git

2. Install the dependencies:  npm install

### Configuration

Configure your environment variables by creating a .env file in the project root. Here are some example environment variables you may need:

MONGODB_URI=your-mongodb-uri
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-aws-s3-bucket-name
SECRET_KEY=your-secret-key-for-jwt

Ensure you replace the placeholder values with your actual configuration.


## Usage

To start the backend server, run: npm start
By default, the server will run on port 5000. You can change this as per your preferences


## API Endpoints

/api/register (POST): Register a new user.
/api/login (POST): Log in and receive an authentication token.
/api/upload (POST): Upload a file and generate a short link.
/api/files/:username (GET): get all files for a user.
/api/files/:id (DELETE): delete a uploaded file.


## Database

Used MongoDB as the db. 2 schemas are used, one for users, other for files, the files has a foreign key of username(unique) to maintain mapping of which file was uploaded by which user.


## Authentication

Bcrypt is used for Authentication
    User Registration (/api/register):
        When a user registers, their username and password are received as part of the request body.
        The password is hashed using bcrypt with a salt to securely store it in the database.
        A new user document is created using Mongoose and saved to the MongoDB database.
    User Login (/api/login):
        When a user logs in, their username and password are received as part of the request body.
        The server attempts to find a user with the provided username in the database.
        If the user is found, bcrypt is used to compare the provided password with the hashed password stored in the database. If the passwords match, it indicates a successful login.
        If the login is successful, the server responds with a success message.

## Deployment

A service called Render (a cloud hosting platform for deployment) was used to deploy this service.
