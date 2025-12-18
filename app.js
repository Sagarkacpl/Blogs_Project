const express = require('express');
const app = express();
const userModal = require('./models/userModels');
const postModal = require('./models/postModels');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


const PORT = 5000

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login',  (req, res) => {
    res.render('login')
})

app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModal.findOne({email: req.user.email}).populate('posts');
    
    res.render('profile', {user})
})

app.post('/posts', isLoggedIn, async (req, res) => {
    let user = await userModal.findOne({email: req.user.email});
    const { content } = req.body

    let post = await postModal.create({
        user: user._id,
        content
    })

    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile')
})

app.post('/register', async (req, res)=> {
    const {username, name, email, age, password} = req.body;
    const user = await userModal.findOne({email});
    if(user){
        return res.status(500).send("User already registered");
    }
        bcrypt.genSalt(12, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hashedPassword) => {
               let createdUser = await userModal.create({
                    username,
                    name,
                    email,
                    age,
                    password : hashedPassword
                });
                let token = jwt.sign({email: email, userid: createdUser._id}, 'shhhhh');
                res.cookie("token", token);
                res.send('User Register Successfully');
          });
        });
})


app.post('/login', async (req, res)=> {
    const {email,  password} = req.body;
    const user = await userModal.findOne({email});
    if(!user){
        return res.status(500).send("Invalid email and password");
    }
    
    bcrypt.compare(password, user.password, (err, result) => {
        if(result){

            let token = jwt.sign({email: email, userid: user._id}, 'shhhhh');
            res.cookie("token", token);
            return res.status(200).redirect("/profile");

        } else {
            res.redirect('/login');
        }

    })
})

app.get('/logout', (req, res) => {
    res.cookie('token', "");
    res.redirect('/login')
})

function isLoggedIn(req, res, next){
    if(!req.cookies.token){
        return res.redirect('/login');
    } else {
        let data = jwt.verify(req.cookies.token ,'shhhhh'); 
        req.user = data;
    }
    next();
}

app.listen(`${PORT}`, ()=>{
    console.log('Server running on PORT ' + `${PORT}`)
})