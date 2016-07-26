/**
 * Created by grant on 16/7/26.
 */
let Promise = require("promise")
let fs = require("fs")
let lineReader = require('line-reader');


let FileManager = function(option) {
    let defaultOption = {
        dataDir:"/tmp/video"

    }

    let readFileToTree = function (file) {
        let tree = {}
        let frist = true;
        let check = function (line) {
            let rst = true;
            if(line.indexOf("-----------")==-1){
                rst = false;
                return rst;
            }
            return rst
        }
        return new Promise(function (resolve,reject) {
            lineReader.eachLine(file,function (line,last,cb) {
                if(frist){
                    if(!check(line)){
                        cb(false)
                        reject()
                    }else{
                        cb(true)
                    }

                    frist = false;
                    return;
                }
                cb(true)

                line = line.split("-")
                switch (line.length){
                    case 1:
                        tree[line[0]] = tree[line[0]] || []
                        break;
                    default:
                        tree[line[0]] = tree[line[0]] || []
                        tree[line[0]].push(line.join("-"))
                        break;
                }
                if(last){
                    resolve(tree)
                }
            })
        })
    }
    let updateFileToDB = function () {
        var sqlite3 = require('sqlite3');
        let db = new sqlite3.Database('/tmp/chain.sqlite3');
        console.log(db)
        db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");
        var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        db.all("SELECT rowid AS id, info FROM lorem", function(err, rows) {});
        db.close();


        // var sqlite3 = require('sqlite3').verbose();
        // var db = new sqlite3.Database('/tmp/1.db');
        // ,function() {
        //     db.run("create table test(name varchar(15))",function(){
        //         db.run("insert into test values('hello,world')",function(){
        //             db.all("select * from test",function(err,res){
        //                 if(!err)
        //                     console.log(JSON.stringify(res));
        //                 else
        //                     console.log(err);
        //             });
        //         })
        //     });
        // db.run("create table test(name varchar(15))")
    }

    this.loadLocalFile = function (file) {
        readFileToTree(file).then(function (tree) {
            //console.log(tree);
            console.log("bg")
            updateFileToDB()
            console.log("end")
        },function (tree) {
            console.log("fail");
        });

    }

}

module.exports = FileManager