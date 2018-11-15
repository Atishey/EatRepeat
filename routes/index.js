var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var app= express();
var mysql= require('mysql');
var random = require('random-number');
var current_date = require('current-date');

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


var gen = random.generator({
  	min:  1,
 	max:  200,
 	integer: true
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
var name,city;
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
						con.query({
							sql : 'select city from Signup where username=?',
							values : [name]
						},function(err,res){
							if(err) throw err;
							else{
								console.log(res);
								city=res[0].city;
							}
						});	

						console.log("USER IS FROM "+city );

						val=true;
						//	console.log("AT HOME "+name);
						 // res.render('home',{title:'Home',User : name});
						res.redirect('/home');
						
							
					}	
				}
				if(val==false)
					res.render('login',{Status: 'Incorrect username or password',title : 'EatRepeat'});
		}
	});

		
});
//------------------------------------------------------------------------------------------------------------------------>

router.get('/home', function(req, res, next) {
	console.log("AT HOME "+name);

	con.query({
		sql : 'select resid,resname,address,phno,city,opentime,closetime,image,cuisine from Restuarant where city=?',
		values : [city]
	}, function(err,result){
			if (err) throw err;
			else {
				res.render('home',{title:'Home',User : name,Data : result});	
			}
		});  
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
//Display Restaurants at Homepage from DropDown

router.post('/find',function(req,res,next){
		city=req.body.findcity;
		res.redirect('/home');
	}
);
//---------------------------------------------------------------------------------------------------------------------------->
//Booking a reservation
var resid;
router.post('/booking',function(req,res,next){
		resid=req.body.RESID;
		console.log("You are booking restuarant with id = "+resid);
		res.render('booking',{title :'EatRepeat',User :name})
	}
);

//Take user input to make the reservation
router.post('/getdata',function(req,res,next){
	var booking_id=gen(5);
	booking_id=booking_id*gen(5)+gen(5);

			con.query({
						sql : 'insert into booking (booking_id,resid,username,name,date,time,seats,email) values (?,?,?,?,?,?,?,?)',
						values : [booking_id,resid,name,req.body.Name,req.body.date,req.body.time,req.body.seats,req.body.email]
						
						},function(err,result){
							if(err) throw err;
							else{
								console.log("Record inserted");
								res.render("booking",{status :"Reservation was succesful",User :name});
							}
						});	
	}
);
//------------------------------------------------------------------------------------------------------->
//Display the reservations made
router.get('/reservations', function(req, res, next) {
	console.log("AT HOME "+name);

	con.query({
		sql : 'select r.resid,r.resname,date,time,seats,name,image,cuisine,address,booking_id,phno from Restuarant r,booking b where r.resid=b.resid and b.username=? and date >= ?',
		values : [name,current_date('date')]
	}, function(err,result){
			if (err) throw err;
			else {
				con.query({
				sql : 'select r.resid,r.resname,date,time,seats,name,image,cuisine,address,booking_id,phno from Restuarant r,booking b where r.resid=b.resid and b.username=? and date < ?',
				values : [name,current_date('date')]
			}, function(err,result2){
			if (err) throw err;
			else{
				console.log(JSON.stringify(result));
				res.render("reservation",{title:"EatRepeat",User: name,data1 :result,data2:result2});
			}

			 });
		}}); 
		
});
//------------------------------------------------------------------------------------------------------->
//Cancel Reservation
router.post('/cancel',function(req,res,next){
	var id=req.body.cancel;
	con.query({
						sql : 'delete from booking where booking_id=?',
						values : [id]
						
						},function(err,result){
							if(err) throw err;
							else{
								console.log("Record deleted");
								res.redirect("/reservations");
							}
						});	
});


//-----------------------------------------------------
router.get('/profile', function(req, res, next) {
	console.log("AT HOME "+name);

	con.query({
		sql : 'select * from Signup where username=?',
		values : [name]
	}, function(err,result){
			if (err) throw err;
			else {
				// console.log(result[0].username);
				res.render('profile',{title:'User Profile',name:result[0].name,username:result[0].username,password:result[0].password,phno:result[0].phno,city:result[0].city,address:result[0].address});	
			}
		});  
});
// -------------------------------------------------------------------------
router.post('/profile', function(req, res, next) {	
	console.log(req.body);
	// console.log(req.body.city);
	con.query({
		sql : 'Update Signup set name= ?,password= ?,city=?,phno=?,username=? where username=?',
		values : [req.body.name,req.body.password,req.body.city,req.body.phno,req.body.uname,name]
	}, function(err,result){
			if (err) throw err;
			else {
				// console.log(result[0].username);
				res.render('login',{Status:'Signup information updated',title:'EatRepeat'});	
			}
		});  
});


module.exports = router;
