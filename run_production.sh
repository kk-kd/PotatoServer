# Rebuild static frontend
cd /home/zz160/PotatoServer/view
npm install
npm run build

# Start/restart pm2
cd ../model
pm2 start index.js --watch