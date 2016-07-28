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

    let mkdirsSync = function(dirname, mode){
        let path = require("path")
        if(fs.existsSync(dirname)){
            return true;
        }else{
            if(mkdirsSync(path.dirname(dirname), mode)){
                fs.mkdirSync(dirname, mode);
                return true;
            }
        }
    }

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
            console.log("read file to tree....:"+file)
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
                    console.log("read file success:"+file)
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
        console.log("update file to db...")
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
        console.log("update file to db complete.")
    }

    this.loadLocalFile = function (file) {
        if(!fs.existsSync(file)){
            console.log("not find file :"+file)
            return;
        }
        console.log("load local file...:"+file)
        readFileToTree(file).then(function (tree) {
            updateFileToDB(tree)
        },function (tree) {
            console.log("fail");
        });
    }
    let compareFileSize = function (s1,s2) {
        if(!s1)return -1
        if(!s2)return 1;
        s1 = s1.toUpperCase();
        s2 = s2.toUpperCase();
        let s1_f = 1;
        let s2_f = 1;
        let num_1 = s1.split("GB")
        if(num_1.length==1){
            num_1 = s1.split("MB")
            s1_f = s1_f*1024
        }

        let num_2 = s2.split("GB")
        if(num_2.length==1){
            num_2 = s2.split("MB")
            s2_f = s2_f*1024
        }
        if(num_1.length==2&&num_2.length==2){
            s1 = num_1[0]*s1_f;
            s2 = num_2[0]*s2_f
            if(s1>s2)return 1;
            if(s1<s2)return 2;
            if(s1==s2)return 0;
        }
        return 0;
    }
    let downloadImage = function (obj,dir) {
        if(!obj)return;
        if(obj.localPath&&fs.existsSync(obj.localPath))return;
        if(!fs.existsSync(dir)){
            mkdirsSync(dir);
        }
        let request =  require('request');
        let utils = require('utility');
        let file = dir+"/"+utils.md5(obj.url)+".jpg";
        console.log("download image :"+obj.url)
        request(obj.url).pipe(fs.createWriteStream(file));
        obj.localPath = file;
        obj.status = 1;
        return obj;
    }
    this.initVideoInfo = function () {
        if(!conf.has("videos").value())return;
        const Magnet = require("./MagnetFind")
        let magnet = new Magnet({
            url:option.magnetSite,
        })

        let videos = conf.get("videos").value();
        let videosDB = conf.get("videos")
        console.log("init video info ....")
        let sleep = 0;
        let imgSleep = 0;
        for(let name in videos){
            let nameList = videos[name]
            for(let code in nameList){
                let codeInfo = nameList[code]
                let magnets = codeInfo.magnets
                if(magnets){
                    magnets.sort(function (o1,o2) {
                        return compareFileSize(o1.size,o2.size)
                    })
                    let output = code;
                    for(let i=0;i<magnets.length;i++){
                        output+=","+magnets[i].magnet
                    }
                    console.log(output)
                }

                // setTimeout(function () {
                //     let dir = videoDir+"/"+name+"/"+code
                //     let obj = downloadImage(codeInfo.cover,dir)
                //     let photos = codeInfo.photo
                //     if(photos){
                //         for(let i=0;i<photos.length;i++){
                //             let obj = downloadImage(photos[i],dir);
                //         }
                //     }
                // },imgSleep+=1500)
                //
                // if(!codeInfo.magnets||codeInfo.magnets.length==0||!codeInfo.cover||!codeInfo.cover.url){
                //     setTimeout(function () {
                //         magnet.find(code).then(function (rst) {
                //             videosDB.set(name+"."+code,rst).value()
                //         })
                //     },sleep+=2000)
                // }
            }
        }

    }
}

module.exports = FileManager