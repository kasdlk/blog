go build -o myapp main.go
nohup ./myapp > myapp.log 2>&1 &
tail -f myapp.log