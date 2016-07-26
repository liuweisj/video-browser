/**
 * Created by grant on 16/7/26.
 */
let Promise = require("promise")
let fs = require("fs")
let lineReader = require('line-reader');
let low = require('lowdb')

let FileManager = function(option) {
    function init() {
        let defaultOption = {
            configFile:"/tmp/video.db.json",
            dataDir:"/tmp/"
        }
        let videoDir = option.dataDir+"/video"
        if(!fs.existsSync(videoDir)){
            fs.mkdirSync(videoDir)
        }
    }

    init();

    let readFileToTree = function (file) {
        let tree = {}
        let first = true;
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
                if(first){
                    if(!check(line)){
                        cb(false)
                        reject()
                    }else{
                        cb(true)
                    }

                    first = false;
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
    let updateFileToDB = function (tree) {
        let db = low(option.configFile, { storage: require('lowdb/lib/file-async') })
        db.defaults({"createTime":new Date(),updateTime:new Date()}).value()
        let videos = db.get("videos")
        if(!db.has("videos").value()){
            videos = {}
            db.set("videos",videos).value()
            videos = db.get("videos")
        }

        for(let name in  tree){
            let ary = tree[name]
            let code = videos.get(name)
            if(!videos.has(name).value()){
                code = {};
                videos.set(name,code).value();
                code = videos.get(name)
            }
            for(let i =0;i<ary.length;i++){
                if(!code.has(ary[i]).value()){
                    code.set(ary[i],{code:ary[i],createTime:new Date(),updateTime:new Date()}).value().code;
                }
            }
        }
        db.write()
    }

    this.loadLocalFile = function (file) {
        readFileToTree(file).then(function (tree) {
            updateFileToDB(tree)
        },function (tree) {
            console.log("fail");
        });

    }

}

module.exports = FileManager