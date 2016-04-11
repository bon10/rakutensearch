Environment Variables
=====================
You must set API KEY for the enviroment variables.  
API KEY is register RAKUTEN Web API.
 
 e.g Linux
   export applicationId="XXXXXX"

How to
=====================
This app's default infrastructure is Openshift(sinatra). 


if you start development, you must create .env file and
set variables of API KEY. 


1. bundle install
2. vi .env and set API KEY
3. bundle exec foreman start
4. access http(s)://youredomain:4567

Production:
 1. sign up to Openshift
 2. create New Sinatra app
 3. clone this project and install library of Openshift
 4. remote add Openshift's app uri(e.g. git remote add origin https://<openshift>
 5. `rhc env set applicationId=<your Application Key of RAKUTEN API>`
 6. git push origin master
 7. access https://<appname>-<username>.rhcloud.com/rakuten.html
 
