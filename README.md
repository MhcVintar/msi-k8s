# MSI Class Project - Web Application Deployment Automation with Kubernetes

## Overview
This project focuses on automating the deployment of a web application for music sharing using Kubernetes. The goal is to create a full-stack application that allows users to register, sign in, upload and download music, as well as delete their uploaded files. The primary aim is to establish a platform for efficient and rapid exchange of audio files. Note that the website is not mobile-friendly yet.

## Team Members
- Jaka Pelko
- Miha Vintar

## Project Components and key features

### 1. Kubernetes Deployment Configuration

This repository includes a set of Kubernetes manifests located in the `k8s` directory. These manifests define the deployment, services, and other resources required for the deployment.

- Nginx Deployment and Service Manifest (`nginx.yml`)
- Express Deployment and Service Manifest (`express.yml`)
- Minio Deployment, Service, PV and PVC Manifest (`minio.yml`)
- Postgres Deployment, Service, PV, PVC Manifest (`postgres.yml`)
- Ingress Controller Configuration Manifest (`ingress.yml`)
- ConfigMap Manifest (`configmap.yml`)
- Secrets Manifest (`secret.yml`)

### 2. Persistent Volumes and Persistent Volume Claims
Persistent Volumes and Claims are used for Minio file storage and database storage, ensuring data persistence between pod restarts.

### 3. Ingress Controller
The Ingress Controller acts as a gateway for managing external traffic.

### 4. High Availability Deployment
Our goal is to make this application HA (highly available). Nginx and Express are configured to have three instances. This design enhances the reliability of our application, minimizing downtime and offering a robust architecture for uninterrupted user access.


### 5. Continuous Integration/Continuous Deployment (CI/CD)
Commit of changes in `express` or `react` directory triggers a CI/CD pipeline, established to automate the Docker image build and push on registry.

### 6. Readiness and Liveness Probes

Our Kubernetes deployment includes configured readiness and liveness probes, designed to enhance the reliability and stability of the application.
[RollingUpdate.webm](https://github.com/MhcVintar/msi-k8s/assets/69330734/d1753c34-05a0-47ac-88d5-8a60e6b302bf)
