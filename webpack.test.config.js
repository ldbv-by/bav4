const path = require('path');

module.exports = {
    mode: 'development',

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.svg$/,
                use: 'svg-url-loader',
            }
        ],
    },

};