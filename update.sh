#!/bin/sh
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./stop.sh"
rsync --delete -avz -e 'ssh -p 22' ./pages/ memlingo@141.164.48.63:~/svc/memlingo/pages/
rsync --delete -avz -e 'ssh -p 22' ./courses/ memlingo@141.164.48.63:~/svc/memlingo/courses/
rsync --delete -avz -e 'ssh -p 22' ./sounds/ memlingo@141.164.48.63:~/svc/memlingo/sounds/
rsync --delete -avz -e 'ssh -p 22' ./memlingo.py memlingo@141.164.48.63:~/svc/memlingo/memlingo.py
rsync --delete -avz -e 'ssh -p 22' ~/tts/?_course.js memlingo@141.164.48.63:~/svc/tts/
#scp -r ./pages/* memlingo@141.164.48.63:~/svc/memlingo/pages/
#scp -r ./sounds/* memlingo@141.164.48.63:~/svc/memlingo/sounds/
#scp -r ./memlingo.py memlingo@141.164.48.63:~/svc/memlingo/
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && python3 ./content_update.py run"
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./run.sh"
