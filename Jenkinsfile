pipeline {
    agent any

    environment {
        IMAGE_NAME = "praveensingam07/nodejs-app"
        TAG = "latest"
        REMOTE_USER = "ubuntu"
        REMOTE_HOST = "35.154.222.141"
    }

    tools {
        nodejs "NODE"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Cloning from GitHub...'
                git branch: 'main', url: 'https://github.com/praveensingam07/node-js-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh 'npm test || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker Image...'
                sh 'docker build -t $IMAGE_NAME:$TAG .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo 'Logging into Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'DockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing image to Docker Hub...'
                sh 'docker push $IMAGE_NAME:$TAG'
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                echo 'Deploying to remote server...'

                sh """
                ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
                    echo "Pulling latest image..."
                    docker pull $IMAGE_NAME:$TAG

                    echo "Stopping old container..."
                    docker stop node-app || true
                    docker rm node-app || true

                    echo "Running new container..."
                    docker run -d -p 3000:3000 --name node-app $IMAGE_NAME:$TAG
                '
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully! ✔️'
        }
        failure {
            echo 'Pipeline failed! ❌'
        }
    }
}