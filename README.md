# park-guide-system web version
innovation project

## How To Run the project
1. Clone the repository in your local machine
2. go inside the *backend* folder
3. Notice there are *composer.lock* and *package-lock.json* files. These keep track of the versions of additional libraries used across various code bases.
4. Run `composer install` to install the backend libraries as defined in the lock file. You will have to install *composer* first if you dont yet have it. [Here's the link.](https://getcomposer.org/download/) 
5. Next, run `npm install` to install the frontend libraries. Again, you will have to install *npm* if you haven't installed it before. [Click here.](https://www.geeksforgeeks.org/how-to-download-and-install-node-js-and-npm/)
6. After all that, open two terminal windows. In one terminal, run `npm run dev` to start serving the front end. In another terminal, run `php artisan serve` to serve the backend as localhost.