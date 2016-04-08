Environment Variables
=====================
You must set API KEY for the enviroment variables.  
API KEY is register RAKUTEN Web API.
 
 e.g Linux
   export applicationId="XXXXXX"

This app's default infrastructure is Openshift(sinatra). 


if you start development, you must create .env file and
set variables of API KEY. 


1. bundle install
2. vi .env and set API KEY
3. bundle exec foreman start
4. access http(s)://youredomain:4567/

