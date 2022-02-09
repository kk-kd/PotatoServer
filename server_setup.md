# Dev Environment

## Install nvm

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`  
`export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"`  
`[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`'

## Install nodejs16

`nvm install 16`  
`nvm use 16`  
`echo "Current node version should be 16\n"`  
`echo "Node Version: "`  
`node -v`

## Install npm

`sudo apt update`
`sudo apt upgrade -y`  
`sudo apt install npm -y`  
`npm install npm@latest -g`  
`echo "npm Version: "`  
`npm -v`

## (Optional) Install tmux

`sudo apt install tmux -y`

## Install postgresql

`sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'`  
`wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -`  
`sudo apt-get update`  
`sudo apt-get -y install postgresql`

### Database setup

`sudo passwd postgres` change user password  
`su postgres`  
`psql` and change user password with `ALTER USER postgres PASSWORD '<new password>';`  
`create database bus;`

## Install rabbitmq

https://www.rabbitmq.com/install-debian.html#apt-quick-start-cloudsmith

sudo systemctl start rabbitmq-server

## Clone the repo

`git clone -b <branch> https://github.com/meganrichards3/PotatoServer.git`

# Production Environment

## Node production environment setup

`export NODE_ENV=production`  
add to `~/.bashrc`

## Install pm2

`npm install -g pm2`

### Configure pm2 to start on boot

`pm2 startup systemd`  
copy-paste what's given

## Enable binding to ports under 1024

`sudo apt-get install libcap2-bin`  
`` sudo setcap cap_net_bind_service=+ep `which node`  ``

## SSL

follow certbot instruction  
`sudo apt -y install snapd`  
`sudo snap install core; sudo snap refresh core`  
`sudo snap install --classic certbot`  
`sudo ln -s /snap/bin/certbot /usr/bin/certbot`  
`sudo certbot certonly --standalone`

## Create safe user group

`sudo addgroup ssl-cert`  
`sudo adduser <name> ssl-cert`  
`sudo adduser root ssl-cert`

Transfer certificate folder ownership  
`sudo chgrp -R ssl-cert /etc/letsencrypt/live`  
`sudo chgrp -R ssl-cert /etc/letsencrypt/archive`

Allow group to open relevant folders  
`sudo chmod -R 750 /etc/letsencrypt/live`  
`sudo chmod -R 750 /etc/letsencrypt/archive`

Restart the server

## Build the app

Rebuild static frontend
`cd /home/zz160/PotatoServer/view`  
`npm install`  
`npm run build`

Start pm2  
`cd ../model`  
`npm install`  
`npm run build`  
`pm2 start build/index.js`  
Use `example_redirect.js` to replace `index.js` for testing purpose

# Deployment Checklist

- Change port to 443
- Change certificate path
- Make sure react-api key is in .env
- Make sure jwt keys are in secrets  
  `cd secrets`  
  `openssl genrsa -out jwt_private.key 512`  
  `openssl rsa -in jwt_private.key -pubout -out jwt_public.key`
- Check that f**\*\*** ormconfig file is in .js
- delete and restart pm2 process if necessary
