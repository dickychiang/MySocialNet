API Server:
http://ec2-52-64-12-169.ap-southeast-2.compute.
amazonaws.com:3000/api

API Explorer (list all methods with description, acts as documentation):
http://ec2-52-64-12-169.ap-southeast-2.compute.amazonaws.com:3000/explorer

Client Sample (static HTML/JS connects to API):
http://ec2-52-64-12-169.ap-southeast-2.compute.amazonaws.com:3000/sample

Test Accounts (username / password / role):
test1 / 123456 / elderly
test2 / 123456 / elderly
test3 / 123456 / family
test4 / 123456 / caregiver
test5 / 123456 / doctor

EXAMPLE:

1. Login:
POST to: http://{domain}/api/users/login
POST data: {
	"username":"test1",
	"password":"123456"
}
Response:{
   "id": $access_token
   ...
   "userId": number
}
You will receive following, keep $access_token for all consequent requests after login.

2. Get friends of current users
Remember to provide the provided $access_token, you can put in query, http header, or cookie in HTTP request,
Following is example with $access_token in query
GET to: http://{domain}/api/users/friends?access_token=$access_token
Response:
Response:{
   "users":[
      {
         "id": number,
         "firstName": string,
         "lastName": string,
         "email": string
         ...
      },
      ...
   ]
}
