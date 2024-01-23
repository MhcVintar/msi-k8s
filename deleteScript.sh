#!/bin/bash

# Delete Services
kubectl delete service minio
kubectl delete service postgres
kubectl delete service nginx
kubectl delete service express

# Delete Deployments
kubectl delete deployments nginx
kubectl delete deployments express

# Delete Statefulsets
kubectl delete statefulset minio
kubectl delete statefulset postgres

# Delete Secrets and ConfigMap
kubectl delete secret musify-secrets
kubectl delete configmap musify-configmap

# Delete Ingress
kubectl delete ingress musify-ingress

# Delete PVs and PVCs (PVs deleted automatically with PVC deletion)
kubectl delete pvc postgres-data-postgres-0
kubectl delete pvc minio-storage-volume-minio-0

# Delete Storage Classes
kubectl delete sc minio-storage-class
kubectl delete sc postgres-storage-class
