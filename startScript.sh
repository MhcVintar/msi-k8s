#!/bin/bash

kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secret.yml
kubectl apply -f k8s/minio.yml
kubectl apply -f k8s/postgres.yml
kubectl apply -f k8s/express.yml
kubectl apply -f k8s/nginx.yml
kubectl apply -f k8s/ingress.yml