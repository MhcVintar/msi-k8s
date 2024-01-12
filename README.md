# MSI Class Project - Web Application Deployment Automation with Docker

## Overview
This project focuses on automating the deployment of a web application for music sharing using Docker. It involves creating a the full-stack application that allows users to register, sign in, upload and download music, as well as delete their uploaded files. The primary goal is to establish a platform for efficient and rapid exchange of audio files. Note that the website is not mobile-friendly yet.

## Team Members
- Jaka Pelko
- Miha Vintar

## Project Components

The project consists of the following key components:

1. **Docker Compose Configuration:**
   - The `docker-compose.yml` file defines the services and their interactions.
   - There are 5 different services implemented.

2. **Docker Volumes:**
   - Volumes are used for Minio file storage and database storage, ensuring data persistence between container restarts.

3. **Multi-stage Builds:**
   - Nginx, express and postgres are compiled by using multistage-builds. The final stage's image is optimized and minimalized by using distroless, alpine images.

4. **Continuous Integration/Continuous Deployment (CI/CD):**
   - A CI/CD pipeline is established to automate the build of nginx image at commit.

## Getting Started
Before proceeding with the steps below, ensure that you have Docker installed on your system as it is a requirement for this project.


1. Clone the repository:

    ```bash
    git clone git@github.com:jakepel03/msi-docker.git
    ```

2. Move to the root directory of the repository:

    ```bash
    cd msi-docker
    ```
    
   ![Screenshot from 2024-01-01 20-00-57](https://github.com/jakepel03/msi-docker/assets/69330734/907ac77a-26f9-4c6b-aa37-5fd662760573)


3. (Optional) You can create an `.env` file in the root folder of the cloned repository and specify the following environmental variables:
    
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `JWT_SECRET`

   If `.env` file is not present, default values will be used for those environmental variables.
  
4. Run the following command to launch the VM:

    ```bash
    docker compose up -d
    ```
   ![Screenshot from 2024-01-01 20-04-05](https://github.com/jakepel03/msi-docker/assets/69330734/2e8a10a5-d2b2-410f-bf3b-326d7615f0b2)

    Wait until containers are started.


5. Once the containers are running, you can access the website on http://localhost


   ![Screenshot from 2024-01-01 20-04-31](https://github.com/jakepel03/msi-docker/assets/69330734/4d50b13a-0f59-4f80-a940-aa04352bf65e)
   
   ![Screenshot from 2024-01-01 20-05-11](https://github.com/jakepel03/msi-docker/assets/69330734/08db1a05-2457-45b1-a3de-56e591f24b65)
   
6. If you want to stop and remove the containers, run:

    ```bash
    docker compose down
    ```
    (add `-v` tag if you also want to remove volumes)
   ![image](https://github.com/jakepel03/msi-docker/assets/69330734/dff33a29-a195-41c1-a763-2b541dff5120)

