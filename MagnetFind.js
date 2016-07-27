/**
 * Created by grant on 16/7/27.
 */
let MagnetFind = function (option) {
    let defaultOpt = {
        "url":"https://www.javbus.com/"
    }
    let getVideoInfo = function (code) {
        return new Promise(function (resolve,reject) {
            let cheerio = require("cheerio");
            let http =  require('nodegrass');
            let headers = {
                "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
                "Referer":option.url
            }
            http.get(option.url+"/"+code,function (data,status,header) {
                let $ = cheerio.load(data);
                let cover = $(".bigImage img").attr("src")
                let photo = []
                $(".photo-frame img").each(function () {
                    photo.push({url:$(this).attr("src"),status:0})
                })
                let tags = []
                $(".genre a").each(function () {
                    tags.push($(this).text().trim())
                })

                let first = true;

                let reg = /var gid = ([0-9]*)/
                let val = reg.exec(data);
                if(val){
                    let gid = val[1]
                    let uc = 0;
                    http.get(option.url+"/ajax/uncledatoolsbyajax.php?gid="+gid+"&lang=zh&uc="+uc,function (data,status,header) {
                        let $ = cheerio.load(data);
                        let rst = {code:code,cover:{url:cover,status:0},magnets:[],photo:photo,tags:tags}
                        $("tr").each(function () {
                            if(first){
                                first = false;
                                return;
                            }
                            let _this = $(this);
                            let td = _this.find("td a")
                            let name = td.eq(0).html().trim();
                            let magnet = td.attr("href")
                            let size = td.eq(1).html().trim()
                            let shareTime = td.eq(2).html().trim();
                            rst.magnets.push({name:name,size:size,shareTime:shareTime,magnet:magnet})
                        })
                        resolve(rst)
                    },headers)
                }
            },headers)
        })
    }
    this.find = function(code){
        return new Promise(function (resolve,rejcet) {
            getVideoInfo(code).then(function (rst) {
                resolve(rst)
            })
        })
    }
}

module.exports = MagnetFind