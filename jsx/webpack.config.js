const path = require('path');

module.exports = {
    entry:'./main.js',
    module:{
        rules:[
            {
                test:/\.js$/,
                use:{
                    loader:"babel-loader",
                    options:{
                        presets:["@babel/preset-env"],
                        plugins:[["@babel/plugin-transform-react-jsx",{pragma:"createElement"}]]
                    }
                }
            }
        ]
    },
    // solve CSP
    devServer:{
        static:{
            directory: path.join(__dirname,'./dist'),
        },
        compress:true,
        port:8888,
        hot:true,
    },
    mode:"development",
}