# PotatoServer

## Server Links

- **Submission**: production!  
  ssh zz160@vcm-23793.vm.duke.edu  
   [website](https://potato.colab.duke.edu)
- **Beta** = production-light  
  ssh zz160@vcm-23919.vm.duke.edu  
   [website](https://potato-beta.colab.duke.edu)
- **Gamma** = integration  
  ssh zz160@vcm-23920.vm.duke.edu

# Connect to Remote Database for Local Testing

Forward local port 5432 to the database  
Beta server - `ssh -L 5432:127.0.0.1:5432 vcm-23919.vm.duke.edu -l zz160`  
Dev server - `ssh -L 5432:127.0.0.1:5432 vcm-23920.vm.duke.edu -l zz160`
