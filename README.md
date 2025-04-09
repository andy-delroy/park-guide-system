# park-guide-system web version
innovation project

## How To Run the project
1. Clone the repository in your local machine
2. go inside the *backend* folder
3. Notice there are *composer.lock* and *package-lock.json* files. These keep track of the versions of additional libraries used across various code bases.
4. Run `composer install` to install the backend libraries as defined in the lock file. You will have to install *composer* first if you dont yet have it. [Here's the link.](https://getcomposer.org/download/) 
5. Next, run `npm install` to install the frontend libraries. Again, you will have to install *npm* if you haven't installed it before. [Click here.](https://www.geeksforgeeks.org/how-to-download-and-install-node-js-and-npm/)
6. copy the contents of .env.example into .env(create tis file if it doesn't exist)
7. Generate your application key with `php artisan key:generate`
8. `php artisan migrate` to migrate all the changes to the temporary sqlite database
9. After you have confirmed your database is working, you can seed your database with mock data by running `php artisan migrate:fresh --seed`. Confirm it with your preferred database monitoring tool or godforbid a terminal interface.
10. After all that, open two terminal windows. In one terminal, run `npm run dev` to start serving the front end. In another terminal, run `php artisan serve` to serve the backend as localhost.
## Reference Video
Refer to the following video as a guide while you code. 
[Video](https://www.youtube.com/watch?v=VrQRa-afCAk&t=1561s)



##AN's PILL##

Before we start, `cp .env.example .env` DO NOT FORGET THIS BEFORE INSTALLING OTHER THINGS

`composer install`

`npm install`

`php artisan key:generate`

`php artisan install:broadcasting`

`composer require laravel/reverb`

`php artisan reverb:install`

`npm install --save-dev laravel-echo`

copy and paste this code into ur .env

  
SESSION_DRIVER=cookie
SESSION_DOMAIN=127.0.0.1
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:8000,localhost:8000,localhost:5173,127.0.0.1:5173,localhost:3000,127.0.0.1:3000
SANCTUM_COOKIE="XSRF-TOKEN"

## HOW TO RUN THE WEB AND MOBILE
### WEB
You need three terminals and make sure to do `cd backend` for all three.
1. `npm run dev`
2. `php artisan serve --host=0.0.0.0 --port=8000`
3. `php artisan reverb:start`
### MOBILE
`cd mobile`

`npx expo start -c`

  





