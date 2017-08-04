/*
20170802

Node.js & Express From Scratch by traversy media.

mongodb setting
shell : mongodb --directoryperdb --dbpath c:\mongodb\data\db --logpath c:\mongodb\log\mongo.log --logappend --rest --install
net start mongodb

// 노드몬 엄청 대단한 듯.. 근데 커멘트 변경이 있어도 재시작하네.

mongodb 쓰기
> use nodekb
switched to db nodekb
> db.createCollection('articles');
{ "ok" : 1 }
> show collections
articles
> db.articles.insert({title:"article one", author:"kim ilsik", body:"This is article one."});
WriteResult({ "nInserted" : 1 })
> db.articles.find();
{ "_id" : ObjectId("5981c8da4305121ea088879f"), "title" : "article one", "author" : "kim ilsik", "body" : "This is article one." }

// bower

bower is a package manager for front end.

// public folder -> static folder, css, html, image, ...

20170803

delete 는 ajax를 이용.

* express-validator, express-messages, express-session, connect-flash
*
* express validator -> 몽고디비에 서브밋 했을 때 잘못된 형식일 경우 그냥 홀드한다.
* 이걸 고치기 위한 것.
*
*
* 현재는 redirect하기 때문에 리로드가 있다. 근데 리로드 없이 필드 검사는 못할까?
*

- passport 사용하기
users 는 모델이 필요하다.

mongodb delete
-> db.users.remove({_id:Objectid(...)});

* 처음부터 만드는 과정을 다시한번 생각해보고, 각각의 것들이 왜 쓰였는지를 생각해보자.

- access control
-> 로그인이 안되었으면 add article에 접근하지 못하게 한다.


/////////////////// 추가하고 싶은것들

- OAuth 활용해보기
-> oauth 가 세션을 대체할 수 있는 것인가?

- 자동 로그아웃 기능?

- 로그인 되면 우상단에 아이디가 보이고, 누르면 미니박스로 여러 기능들을 할 수 있게끔.

/////////////////// 에러 목록

- 20170803 : add article, get article  등에서 계속 로그아웃 되고 edit, delete가 계속 안보인다.
-> 이 문제는 라우트를 바꿈으로서 해결하였다.
-> passport -> home directory -> user/article route 순으로 내려가게끔 했더니 갑자기 모든 곳에서 로그인이 된다...
-> express route order 이야기.
https://stackoverflow.com/questions/32603818/order-of-router-precedence-in-express-js


---- 20170804

digital ocean 으로 배포
droplets -> vps

ubuntu에 nodejs설치

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install  -y nodejs

mongodb installation
(in order)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
stop --> sudo service mongod stop


 */

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

// bring in models
var Article = require('./models/article');
var User = require('./models/user');


mongoose.connect(config.database);
var db = mongoose.connection;

// check for db errors
db.once('open', function() {
    console.log('connected to mongodb');
});

db.on('error', function(err) {
    console.log(err);
});

//body parser middleware
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set public folder
// public folder 사용하는 게 꽤나 신기하다. 자동으로 public을 앞에 추가해준다...
// __dirname : The directory name of the current module.
// documentation : http://expressjs.com/ko/starter/static-files.html
app.use(express.static(path.join(__dirname, 'public')));


// express session middleware
app.use(session({
    secret : 'keyboard cat',
    resave : true, // message 를 쓰려면 resave 를 true로.. 근데 왜 그럴까??
    saveUninitialized : true
    //cookie : {secure : true}
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// express validator middleware
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// next : next piece of middlware
app.get('*', function (req, res, next) {
    console.log('asterisk log');
    console.log('user : ', req.user);
    res.locals.user = req.user || undefined;
    next();
});

app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if (err)
            console.log(err);
        else
        {
            res.render('index', {
                title : 'hdce',
                articles : articles
            });
        }
    });
});

// route files
var articles = require('./routes/articles')(Article);
app.use('/article', articles);
var users = require('./routes/users');
app.use('/user', users);

app.use(function (req, res, next) {
    console.log('Time:', Date.now());
    next();
});

app.listen(80, function() {
    console.log('server running on port 80...');
});
