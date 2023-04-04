# TESTING-2110336-SOFTWARE-ENG-II

## Description

- This app allows users to register and log in with a username and password. The app also implements authentication and authorization through the use of cookies.
- There are three types of roles: USER, ADMIN, and SUPER_ADMIN. Only SUPER_ADMIN can change the roles of other users.
- The app is built using `Node.js` and `Express.js` and uses `MongoDB` as the database.
- The app and database can be run by executing the `start.sh` script. The script will copy the environment variables and create the necessary Docker containers as specified in the Docker Compose file.

## Usage

The app container uses port `8080` and the MongoDB container uses port `27017`. You can test the app by using `Postman` to send requests to the available endpoints. You can also connect to the MongoDB database using `MongoDB Compass` to view the stored data.

Upon running the app, data for `6 users will be upserted` into the database. These default users include 2 regular users, 2 admins, and 2 super admins. To log in, students can use the `existing userId` with the corresponding username and password. For example, the username `super1` has the password `super1`.

## Installation

### For Mac and Linux

1. Clone this repository
2. Run `chmod +x start.sh` to make the script executable
3. Run `./start.sh` to start the app

### For Windows

1. Clone this repository
2. Create `.env` file in the root directory. (Copy the contents of `.env.example` in the `root directory` and paste it into .env)
3. In the root directory, run `docker-compose --env-file .env up -d --build` to start the app

## Notes

- After finishing the assignment, do not forget to stop the containers.
