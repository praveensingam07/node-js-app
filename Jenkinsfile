pipeline {
    agent any

    environment {
        IMAGE_NAME = "praveensingam07/nodejs-app"
        TAG = "${BUILD_NUMBER}"           // Versioned deployment
        REMOTE_USER = "ubuntu"
        REMOTE_HOST = "35.154.222.141"
        CONTAINER_NAME = "node-app"
        PREV_CONTAINER_NAME = "node-app-prev"
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
                    echo "Pulling latest image version..."
                    docker pull $IMAGE_NAME:$TAG

                    # Stop old container
                    docker stop $CONTAINER_NAME || true

                    # Rename for backup (rollback)
                    docker rename $CONTAINER_NAME $PREV_CONTAINER_NAME || true

                    # Run new container
                    docker run -d -p 3000:3000 --name $CONTAINER_NAME $IMAGE_NAME:$TAG


                    echo "Waiting 10 seconds for app to start..."
                    sleep 10

                    echo "Health check..."
                    if ! curl -f http://localhost:3000; then
                        echo "Health check failed! Rolling back..."
                        docker stop $CONTAINER_NAME || true
                        docker rm $CONTAINER_NAME || true
                        
                        if [ \$(docker ps -a -q -f name=$PREV_CONTAINER_NAME) ]; then
                            docker rename $PREV_CONTAINER_NAME $CONTAINER_NAME
                            docker start $CONTAINER_NAME
                            echo "Rollback complete. Previous version is now live."
                        fi
                        exit 1
                    fi

                    # Remove backup if deployment is successful
                    docker rm -f $PREV_CONTAINER_NAME || true

                    echo "Deployment successful!"
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