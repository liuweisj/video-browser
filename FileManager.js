/**
 * Created by grant on 16/7/26.
 */
let Promise = require("promise")
let fs = require("fs")
let lineReader = require('line-reader');
let low = require('lowdb')

let FileManager = function(option) {
    let videoDir,conf;
    function init() {
        let defaultOption = {
            configFile:"/tmp/video.db.json",
            dataDir:"/tmp/"
        }
        videoDir = option.dataDir+"/video"
        if(!fs.existsSync(videoDir)){
            fs.mkdirSync(videoDir)
        }
        conf = low(option.configFile, { storage: require('lowdb/lib/file-async') })
        conf.autoSave = true;
        conf.defaults({"createTime":new Date(),updateTime:new Date()}).value()
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
        let videos = conf.get("videos")
        if(!conf.has("videos").value()){
            videos = {}
            conf.set("videos",videos).value()
            videos = conf.get("videos")
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
    }

    this.loadLocalFile = function (file) {
        readFileToTree(file).then(function (tree) {
            updateFileToDB(tree)
        },function (tree) {
            console.log("fail");
        });
    }
    let downloadImage = function (obj) {

    }
    this.initVideoInfo = function () {
        if(!conf.has("videos").value())return;
        const Magnet = require("./MagnetFind")
        let magnet = new Magnet({
            url:option.magnetSite,
        })

        let videos = conf.get("videos").value();
        let videosDB = conf.get("videos")
        let sleep = 0;
        for(let name in videos){
            let nameList = videos[name]
            for(let code in nameList){
                let codeInfo = nameList[code]
                if(!codeInfo.magnets||codeInfo.magnets.length==0||!codeInfo.cover||!codeInfo.cover.url){
                    setTimeout(function () {
                        magnet.find(code).then(function (rst) {
                            videosDB.set(name+"."+code,rst).value()
                        })
                    },sleep+=2000)
                }
            }
        }

    }
}

module.exports = FileManager