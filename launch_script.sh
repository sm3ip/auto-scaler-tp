#!/bin/bash
#./launch_script $nbPoints (considered to be inside work folder when launched)

echo '============= LOG : setting up docker ============='
g5k-setup-docker -t
docker run hello-world
echo '============= LOG : downloading minikube ============='
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start
minikube update-context
minikube status
minikube start

echo '============= LOG : downloading kubectl ============='
sudo-g5k apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo-g5k gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo-g5k chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo-g5k tee /etc/apt/sources.list.d/kubernetes.list
sudo-g5k chmod 644 /etc/apt/sources.list.d/kubernetes.list
sudo-g5k apt-get update
sudo-g5k apt-get install -y kubectl
kubectl get pods -A

echo '============= LOG : install node and npm ============='
sudo-g5k apt-get install snapd
sudo-g5k snap install --classic code
sudo-g5k apt-get install -y npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo-g5k -E bash -
sudo-g5k apt-get install -y nodejs
node -v

echo '============= LOG : begin profiling ============='
kubectl create -f k8-tp-04-busy-box-deployment.yaml
kubectl get deployments
kubectl get pods
kubectl scale --replicas=5 -f k8-tp-04-busy-box-deployment.yaml
kubectl create -f k8-tp-04-busy-box-service.yaml
minikube service list

echo '============= LOG : installing dependencies ============='
npm init --yes
npm install express ip axios colors fs child_process

echo '============= LOG : do profiling ============='
chmod u+x main-load-profiler.sh
node main-load-generator.js &
sleep 5
./main-load-profiler.sh $1
sleep 10
rm dataForGraph.json

echo '============= LOG : time to launch js files ============='
echo '============= LOG : load gen launched ============='
node main-auto-scaler.js &
sleep 5
echo '============= LOG : auto scaler launched ============='
node test-auto-scaler.js 10 25 &&
echo '============= LOG : WAITING FOR DATA =============' $(date)
sleep 40
echo '============= LOG : Creating graphs =============' $(date)
python graph.py
echo '============= LOG : Graphs created ============='

kubectl delete --all services
kubectl delete --all deployments
kubectl delete --all pods
echo '============= LOG : Deployments deleted ============='
echo '============= LOG : Script Done ============='