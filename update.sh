#!/bin/sh
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./stop.sh"
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./stop2.sh"
rsync --delete -avz -e 'ssh -p 22' ./pages/ memlingo@141.164.48.63:~/svc/memlingo/pages/
rsync --delete -avz -e 'ssh -p 22' ./pages2/ memlingo@141.164.48.63:~/svc/memlingo/pages2/
rsync --delete -avz -e 'ssh -p 22' ./courses/ memlingo@141.164.48.63:~/svc/memlingo/courses/
rsync --delete -avz -e 'ssh -p 22' ./sounds/ memlingo@141.164.48.63:~/svc/memlingo/sounds/
rsync --delete -avz -e 'ssh -p 22' ./*.py memlingo@141.164.48.63:~/svc/memlingo/
rsync --delete -avz -e 'ssh -p 22' ./*.ico memlingo@141.164.48.63:~/svc/memlingo/
# rsync --delete -avz -e 'ssh -p 22' ./*.json memlingo@141.164.48.63:~/svc/memlingo/
rsync --delete -avz -e 'ssh -p 22' ./*.txt memlingo@141.164.48.63:~/svc/memlingo/
rsync --delete -avz -e 'ssh -p 22' ~/tts/*_course.js memlingo@141.164.48.63:~/svc/tts/
#scp -r ./pages/* memlingo@141.164.48.63:~/svc/memlingo/pages/
#scp -r ./sounds/* memlingo@141.164.48.63:~/svc/memlingo/sounds/
#scp -r ./memlingo.py memlingo@141.164.48.63:~/svc/memlingo/
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && python3 ./content_update.py run"
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./run.sh"
ssh memlingo@141.164.48.63 "cd ~/svc/memlingo/ && ./run2.sh"