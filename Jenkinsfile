pipeline {
  agent any
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Deploy') {
      steps {
        sh 'docker compose pull || true'
        sh 'docker compose up -d --build'
      }
    }
  }
}