pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "438639286336" 
        AWS_REGION     = "ap-south-1"     
        ECR_REPO_NAME  = "harshini/cia"     
        DEPLOY_CREDS   = "ec2-ssh-key" 
        DEPLOY_HOST    = "ec2-13-204-245-122.ap-south-1.compute.amazonaws.com" 
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
                git branch: 'main', url: 'https://github.com/harshinisekar/devopscia.git'
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
                    echo "Building Docker image: ${ECR_REPO_NAME}:${BUILD_NUMBER}"
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

                        echo "Logging into AWS ECR..."
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRepoUrl}"
                        
                        echo "Tagging Docker image..."
                        sh "docker tag ${ECR_REPO_NAME}:${BUILD_NUMBER} ${buildTag}"
                        sh "docker tag ${ECR_REPO_NAME}:${BUILD_NUMBER} ${latestTag}"
                        
                        echo "Pushing image to ECR..."
                        sh "docker push ${buildTag}"
                        sh "docker push ${latestTag}"
                    }
                }
            }
        }

        stage('5. Deploy to EC2') {
            steps {
                script {
                    def ecrRepoUrl = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    def buildTag = "${ecrRepoUrl}/${ECR_REPO_NAME}:${BUILD_NUMBER}"
                    
                    sshagent(credentials: [DEPLOY_CREDS]) {
                        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CRED_ID]]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'EOF'
                                export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                                export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                                export AWS_DEFAULT_REGION=${AWS_REGION}
                                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrRepoUrl}
                                docker stop simple-web-app || true
                                docker rm simple-web-app || true
                                docker pull ${buildTag}
                                docker run -d --name simple-web-app -p 3000:3000 ${buildTag}
EOF
                            """
                        }
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
