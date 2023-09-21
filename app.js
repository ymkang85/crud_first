const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const fs = require('fs');

const connection = mysql.createConnection({
    user:'root',
    password:'root',
    database: 'myboard',
    host:'localhost',
    port: 3306
});

const app = express();
app.set('port', 8080);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true
});

app.use(bodyParser.urlencoded({extended: false}));
//connection.connect();

app.get('/', (req, res)=>{
    const querys = 'select id, writer, title, date_format(wdate, "%y-%m-%d %T") as nowdate from mybbs order by id desc limit 0, 20';
    connection.query(querys, (error, rows)=>{
        if(error) throw error;
        
        res.render('index', {rows});
    });   
}); // 첫 화면


app.get('/delete/:id', (req, res)=>{
    const id = req.params.id;
    const querys = 'delete from mybbs where id=?';
    connection.query(querys,id, (error, rows)=>{
        if(error) throw error;
        res.redirect('/');
    });
});//sql delete구문


app.get('/insert', (req,res)=>{
    const querys = 'select * from mybbs';
    connection.query(querys, (error, result)=>{
        if(error) throw error;
        res.render('insert',{mybbs : result});
    });
});
app.post('/insert', (req,res)=>{
    const writer = req.body.writer;
    const title = req.body.title;
    const content = req.body.content;
    
    const querys = `insert into mybbs (id, writer, title, content, wdate) values (default, '${writer}', '${title}', '${content}', default)`;
    connection.query(querys, (error, rows)=>{
        if(error) throw error;
        console.log(rows);
        res.redirect('/');
    });
});//sql 인서트구문
    

app.get('/edit/:id', (req, res)=>{
    const id = req.params.id;
    const querys = 'select * from mybbs where id=?';
    connection.query(querys, [id], (error, rows)=>{
        if(error) throw error;
       // console.log(rows);
        res.render('edit',{id:rows});
    });
});
app.post('/update/:id', (req,res)=>{
    const id = req.params.id;
    const querys = 'update mybbs set ? where id=' + id;
    connection.query(querys, req.body, (error, rows)=>{
        if(error) throw error;
        console.log(rows);
        res.redirect('/');
    });
}); //update 구문


//에러처리
app.use((req, res, next)=>{
    const error = new Error(`${req.method} ${req.url} 페이지를 찾을 수 없습니다.`);
    error.status = 404;
    next(error);
});
app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = err;
    res.status(err.status || 500);
    res.render(500);
});

//connection.end();
app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중...');
});