# KIITHUB

This Project aims to connect University students to sell and buy their used items. Sellers get a convenient platform to list their items, and Buyers get books and other articles at low prices, along with a chat feature to clear any queries they may have with the product.

## Features and Tech Stack

- #### ReactJs
Used this framework to build the frontend of the website as a SPA Single Page Application to procide somooth user experience.

- #### Mongodb Atlas
Used for maintaining database of students registering on the site as well as details of all the item listings.

- #### Node Js and Express framework
Used for building the backend server of the project.

- #### Bcrypt Library
Used in sync with Node Js to ensure that passwords are properly hashed before being placed into the Database

- #### Socket.io
Used to setup text Chat Application between Buyer and the seller.

- #### JWT and Sessions
Used this Authenctication System to make sure the user is logged in before accessing any personal info on the site


Install dependencies on both frontend and backend folder

```bash
  npm install
```

Start the frontend React application

```bash
  npm run start
```
Start the backend Server 

```bash
  nodemon app.js
```  
Please make sure you have config.env file setup in the backend directory. The Format is demostrated in config.env.example file.

## Roadmap

- Additional Sign in Options with Google and Github
- Adding Lost and FOund Item Section
- Adding Wishlist functionality

Made by Harsh Shandilya(KIIT University)

