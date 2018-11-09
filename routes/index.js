var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var app= express();
var mysql= require('mysql');

app.use(bodyParser.urlencoded({ extended: false }));

var con = mysql.createConnection({
  host:'localhost',
  user: 'root',
  password: 'negiamit97',
  database: 'EatRepeat'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});






/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'EatRepeat' });
});

/*router.get('/login',function(req,res,next){
	res.render('login',{title:'Login Form'});
}); */

router.get('/signup',function(req,res,next){
		res.render('signup',{title:'Signup'});
});

//USER LOGIN
//------------------------------------------------------------------------------------------------------------------------>
var name;
router.post('/login1',function(req,res,next){
	name = req.body.username;
	var password = req.body.password;
	var i;
	var val=false;
	con.query({
		sql : 'select username,password from Signup',
		values :[name,password]
	}, function(err,result){
		if (err) throw err;
		else {
			//console.log(JSON.stringify(result));
			console.log(result);
			for(i=0;i<result.length;i++){
					if(result[i].username==name && result[i].password==password) {
						console.log('Login succesful with username: '+ name);
						val=true;
						res.redirect('/home');
						
							
					}	
				}
				if(val==false)
					res.render('login',{Status: 'Incorrect username or password',title : 'EatRepeat'});
		}
	});

		
});

router.get('/home', function(req, res, next) {
  res.render('home',{title:'Home'});
});

//------------------------------------------------------------------------------------------------------------------------>
//Sign up

var checkval ;
router.post('/signup',function(req,res){
	checkval=true;
	var uname = req.body.username;
	var password= req.body.password;
	var i;
	con.query({
		sql : 'select username from Signup',
	},function(err,result1,next){
		if (err) throw err;
		else {
				console.log("Name :"+ uname);
				console.log("Users" + result1);
				for(i=0;i<result1.length;i++){
					console.log(result1[i].username);
					if(result1[i].username==uname) {
						checkval=false;
					
						break;
					}
				}


				console.log("Check val final val is"+ checkval);

				if(checkval==false) {
					res.render('signup',{title : "Signup",Status : "Username already exists,try again!"});
				} 
				if(checkval==true)	{
					
					con.query({
					sql : 'insert into Signup (name,username,password,address,city,phno) values (?,?,?,?,?,?)',
					values : [req.body.name,uname,password,req.body.email,req.body.city,req.body.phno]
				}, function (err, result) {
    					if (err) {
    						throw err;
    					}	
    					else{
   						
							console.log("here1");
							res.render('login',{Status: 'New Account Created',title : 'EatRepeat'});
					
						}
		
					});
				}
		}
	});
});

//-------------------------------------------------------------------------------------------------------------------------->


module.exports = router;
