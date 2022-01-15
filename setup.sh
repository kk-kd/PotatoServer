# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# use node 16
nvm install 16
nvm use 16
echo "Current node version should be 16\n"
echo "Node Version: "
node -v

# install and update npm
sudo apt update
sudo apt upgrade -y
sudo apt install npm -y
npm install npm@latest -g
echo "npm Version: "
npm -v

# install tmux
sudo apt install tmux -y


git clone -b <branch> https://github.com/meganrichards3/PotatoServer.git