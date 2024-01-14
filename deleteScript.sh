#!/bin/bash

# Delete Services
kubectl delete service minio
kubectl delete service postgres
kubectl delete service nginx
kubectl delete service express

# Delete Deployments
kubectl delete deployments minio
kubectl delete deployments postgres
kubectl delete deployments nginx
kubectl delete deployments express

# Delete Ingress
kubectl delete ingress musify-ingress

# Delete PVs and PVCs
kubectl delete pvc minio-storage-claim
kubectl delete pvc postgres-storage-claim
kubectl delete pv minio-storage-volume
kubectl delete pv postgres-storage-volume

# Delete Storage Classes
kubectl delete sc --all
