const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const entries = ["przegladaj_oceny.content-script"]

const ignorePatterns = [
    "**/manifest-**",
    "**/dist/**",
    "**/src/**",
    "**/README.md",
    ...entries.map((entry) => `**/${entry}.js`),
  ];

module.exports = {
    entry: Object.fromEntries(
        entries.map((entry) => [
            entry,
            path.join(__dirname, "./extensions/combined", `${entry}.js`)
        ])
    ),
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "./extensions/combined/dist"),
        clean: true
    },
    optimization: {
        minimize: false,
    },
    watchOptions: {
        ignored: "**/dist/**",
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "./extensions/combined",   
                    to: "./chrome",
                    noErrorOnMissing: true,
                    globOptions: {
                        ignore: ignorePatterns
                    }
                },
                {
                    from: "./extensions/combined/manifest-chrome.json",   
                    to: "./chrome/manifest.json"
                }
            ]
        }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {
                            source: "./extensions/combined/dist/**.js",
                            destination: "./extensions/combined/dist/chrome/"
                        }
                    ]
                }
            }
        })
    ]
}