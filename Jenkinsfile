env.SERVICE_ID='1s29'

node {
   stage('Checkout') {
      git 'https://github.com/terafin/mqtt-presence.git'
   }
   stage('Docker Build') {
       sh 'docker build --rm=false -t "$DOCKER_USER/$JOB_NAME" .'
       sh 'docker build --rm=false -t "registry/$JOB_NAME" .'
   }
   stage('Push to Docker') {
      sh 'docker login -u "$DOCKER_USER" -p "$DOCKER_PASS"'
      sh 'docker push registry/$JOB_NAME'
      sh 'docker push $DOCKER_USER/$JOB_NAME'
   }
   stage('Deploy to Rancher') {
      sh 'curl --user $AUTH_PARAMETERS http://rancher-webhook/api/services/$SERVICE_ID/upgrade'
      sh 'curl --user $AUTH_PARAMETERS http://rancher-webhook/api/services/$SERVICE_ID/finish_upgrade'
    }
   stage('Notify') {
      sh 'curl -s --form-string "token=$PUSHOVER_APP_TOKEN"  --form-string "user=$PUSHOVER_USER_TOKEN"  --form-string "message=$JOB_NAME deployed to home" https://api.pushover.net/1/messages.json'
    }
}
