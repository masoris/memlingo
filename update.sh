#!/bin/sh
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./stop.sh"
rsync -avz -e 'ssh -p 22' ./pages/ memlingo@141.164.48.63:~/svc/memlingo/pages/
rsync -avz -e 'ssh -p 22' ./sounds/ memlingo@141.164.48.63:~/svc/memlingo/sounds/
rsync -avz -e 'ssh -p 22' ./memlingo.py memlingo@141.164.48.63:~/svc/memlingo/memlingo.py
#scp -r ./pages/* memlingo@141.164.48.63:~/svc/memlingo/pages/
#scp -r ./sounds/* memlingo@141.164.48.63:~/svc/memlingo/sounds/
#scp -r ./memlingo.py memlingo@141.164.48.63:~/svc/memlingo/
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./run.sh"