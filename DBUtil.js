// let util = require('util');
// let sqlite3 = require('sqlite3');
// let db;
// sqlite3.verbose();
//
//
// exports.connect = function(callback){
//     db = new sqlite3.Database("fs.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
//         function(err){
//             if (err){
//                 util.log('FAIL on creating database ' + err);
//                 callback(err);
//             } else {
//                 callback(null);
//             }
//         });
// }
//
// //此处的disconnect函数是空的
// exports.disconnect = function(callback){
//     callback(null);
// }
//
// exports.setup = function(callback){
//     db.run("CREATE TABLE IF NOT EXISTS notes " +
//         "(ts DATETIME, author VARCHAR(255), note TEXT)",
//         function(err){
//             if (err){
//                 util.log('FAIL on creating table ' + err);
//                 callback(err);
//             } else {
//                 callback(null);
//             }
//         });
// }
//
// exports.emptyNote = {"ts": "", author: "", note: ""};
// exports.add = function(author, note, callback){
//     db.run("INSERT INTO notes (ts, author, note) " +
//         "VALUES (?, ?, ?);",
//         [new Date(), author, note],
//         function(error){
//             if (error){
//                 util.log('FAIL on add ' + error);
//                 callback(error);
//             } else {
//                 callback(null);
//             }
//         });
// }
//
//
// exports.delete = function(ts, callback){
//     db.run("DELETE FROM notes WHERE ts = ?;",
//         [ts],
//         function(err){
//             if (err){
//                 util.log('FAIL to delete ' + err);
//                 callback(err);
//             } else {
//                 callback(null);
//             }
//         });
// }
//
// exports.edit = function(ts, author, note, callback){
//     db.run("UPDATE notes " +
//         "SET ts = ?, author = ?, note = ? " +
//         "WHERE ts = ?",
//         [ts, author, note, ts],
//         function(err){
//             if (err){
//                 util.log('FAIL on updating table ' + err);
//                 callback(err);
//             } else {
//                 callback(null);
//             }
//         });
// }
//
// exports.allNotes = function(callback){
//     util.log(' in allnote');
//     db.all("SELECT * FROM notes", callback);
// }
//
// exports.forAll = function(doEach, done){
//     db.each("SELECT * FROM notes", function(err, row){
//         if (err){
//             util.log('FAIL to retrieve row ' + err);
//             done(err, null);
//         } else {
//             doEach(null, row);
//         }
//     }, done);
// }
//
//
// exports.findNoteById = function(ts, callback){
//     var didOne = false;
//     db.each("SELECT * FROM notes WHERE ts = ?",
//         [ts],
//         function(err, row){
//             if (err){
//                 util.log('FAIL to retrieve row ' + err);
//                 callback(err, null);
//             } else {
//                 if (!didOne){
//                     callback(null, row);
//                     didOne = true;   //保证回调函数只被执行一次
//                 }
//             }
//         });
// }