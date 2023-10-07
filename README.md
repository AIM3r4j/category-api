# Category API

This is an API for managing categories. It is built with NestJS, GraphQL, TypeScript, NodeJS, ExpressJS, and MongoDB & Redis for Caching.

# Documentation

You can go to '/graphql' route after starting the app to get documentation and input/output schemas.

# Getting Started

To run the API on your local machine, follow these steps:

## Clone the repository to your local machine

```sh
git clone https://github.com/aim3r4j/category-api.git
```

Navigate inside the folder

```sh
cd category-api
```

Install all the dependecies

```sh
npm ci
```

Set the environment variables in a .env file according to the .env.example file and Install & start redis server on your machine

```sh
sudo service redis-server start
```

Finally, Run the dev script to start the application in development environment

```sh
npm run start:dev
```

The app will now be running on http://localhost:3000.
