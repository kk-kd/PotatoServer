## Quick Start

1. Start the PostgreSQL Server with: `ssh -L 5432:127.0.0.1:5432 vcm-23920.vm.duke.edu -l zz160`
2. To start the backend, cd into `PotatoServer/model/` and type `npm run type-start`.
3. In your browser, go to localhost:3000/api/<table_name> to check to see you see the json package, ie localhost:3000/api/students