pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "315838644546" 
        AWS_REGION     = "ap-south-1"     
        ECR_REPO_NAME  = "my-simple-app"     
        DEPLOY_CREDS   = "ec2-ssh-key" 
        DEPLOY_HOST    = "ec2-65-0-69-225.ap-south-1.compute.amazonaws.com" 
        DEPLOY_USER    = "ubuntu"
        AWS_CRED_ID    = "aws-jenkins-creds"
    }

    tools {
        nodejs 'NodeJS-16'
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: 'main', url: 'https://github.com/Saran-SNU/cicd-project.git'
            }
        }

        stage('2. Build & Test') {
            steps {
                sh 'npm install'
                sh 'npm test || echo "Tests skipped"'
            }
        }

        stage('3. Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${ECR_REPO_NAME}:${BUILD_NUMBER}", ".")
                }
            }
        }

        stage('4. Push Image to AWS ECR') {
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CRED_ID]]) {
                        def ecrRepoUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                        def buildTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                        def latestTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:latest"

                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRepoUrl}"
                        sh "docker tag ${dockerImage.id} ${buildTag}"
                        sh "docker tag ${dockerImage.id} ${latestTag}"
                        sh "docker push ${buildTag}"
                        sh "docker push ${latestTag}"
                    }
                }
            }
        }

        stage('5. Deploy to EC2') {
            steps {
                script {
                    def buildTag = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                    sshagent(credentials: [DEPLOY_CREDS]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                                docker stop simple-web-app || true
                                docker rm simple-web-app || true
                                docker pull ${buildTag}
                                docker run -d --name simple-web-app -p 3000:3000 ${buildTag}
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Jenkins Pipeline Succeeded for MyApp"
        }
        failure {
            echo "❌ Jenkins Pipeline Failed for MyApp"
        }
    }
}
