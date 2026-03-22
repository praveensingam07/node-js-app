pipeline {
    agent any

    environment {
        IMAGE_NAME = "nodejs-app"
        TAG = "latest"
    }

    tools {
        nodejs "Node18"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Cloning from GitHub...'
                git branch: 'main', credentialsId: 'GitHub', url: 'https://github.com/praveensingam07/node-js-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Dependencies...'
                sh 'npm install'
            }
        }

        stage('Run tests'){
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

        stage('Run Container') {
            steps {
                echo 'Deploying the latest version of NodeJS application...'
                sh '''
                docker stop node-app || true
                docker rm node-app || true
                docker run -d -p 3000:3000 --name node-app $IMAGE_NAME:$TAG
                '''
            }
        }
    }
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}