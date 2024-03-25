# Fitness Dashboard Application

## Description

This application is a dynamic, user-friendly web fitness dashboard built using React.js. It's designed to help users track their fitness progress over time with an intuitive and easy-to-use interface. Users can log their weight, track calories consumed, and view a visual representation of their data.

## Main Features

- **Dashboard**: The application's dashboard provides an at-a-glance view of the user's fitness progress. It features a weight graph that dynamically displays weight data over time, helping users visualize their progress.

- **Calorie Tracking**: Users can keep track of their daily calorie intake through a convenient pie chart and a detailed table. Future updates will allow users to add food items along with their corresponding caloric values, providing a more comprehensive view of their dietary habits.

- **Weight Log**: Users can log their weight data, which is then utilized to populate the dynamic weight graph on the dashboard.

- **Profile Page**: Users have their dedicated profile page where they can view and manage their profile information.

- **Dynamic Navigation Bar**: Based on user authentication status, the navigation bar dynamically updates to provide a seamless and personalized user experience.

- **User Authentication and Protected Routes**: The application ensures certain features are only accessible to authenticated users, enhancing security and personalization. Unauthenticated users trying to access these features will be redirected to a login page.

## Technology Stack

### Frontend

- **React.js** - A JavaScript library for building user interfaces.
- **React Router DOM** - DOM bindings for React Router.
- **Tailwind CSS** - A utility-first CSS framework for rapidly building custom user interfaces.

### Backend

- **Node.js** - JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js** - Web application framework for Node.js.
- **MySQL** - An open-source relational database management system.


## Installation

Before you start installation, make sure you have Node.js and npm installed on your machine.

1. Clone the repository

    ```bash
    git clone https://github.com/username/my-react-app.git
    ```

2. Install the dependencies

    ```bash
    cd my-react-app
    npm install
    ```

3. Start the local development server

    ```bash
    npm start
    ```

## Usage

Once you've installed the application, navigate to `http://localhost:3000` in your web browser. If you're an unauthenticated user, you will see the public page with an option to log in. Once logged in, you'll have access to the dashboard, calendar, and profile pages.


