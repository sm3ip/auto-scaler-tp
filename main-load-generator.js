//npm init --yes
//npm install express ip axios colors fs child_process


const express = require('express')
const axios = require('axios')
const ip = require("ip")
var colors = require('colors');
const fs = require('fs')
const { execSync } = require('child_process')

const app = express()
const ipAddress = ip.address()
const ipPort = 4000

let arrResponses = []
let dataForGraph = []
let urlBusyBox = null
let timerLoadGeneration = null
let timerPrintResults = null

app.use(express.json({
    inflate: true,
    limit: '100kb',
    reviver: null,
    strict: true,
    type: 'application/json',
    verify: undefined
}))

///////////////////////////////////////////////////////////////////////////////
function sendRequestAxiosPost(url, timeStamp, dataObj) {
    axios.post(url, dataObj)
        .then((res) => {
            arrResponses.push({
                'Request': dataObj,
                'Response': res.data['Message'],
                'TimeStamp': timeStamp,
                'TotalDelay': (Date.now() - timeStamp)
            })
        })
        .catch((err) => {
            //console.log(err)
        })
}

///////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.send(`
    <h1>Simple Load Generator</h1>
    <p>&nbsp;</p>
    <h2>Use JSON commands to generate load</h2>
    `)
})

app.post('/json', (req, res) => {
    let dataForGraph = []
    let ans = ""
    let t1, t2, t3
    let x1, x2, x3

    switch (req.body['MessageType']) {
        case 'Setting':
            ans = "Config/Update"
            urlBusyBox = req.body['UrlBusyBox']

            break;

        case 'Command':
            ans = `Execute:${req.body['NodeCommand']}`
            switch (req.body['NodeCommand']) {
                case 'GenerateLoad':
                    console.log('    Data Generation => Start')
                    arrResponses = []
                    t1 = Date.now()
                    clearInterval(timerLoadGeneration)
                    clearInterval(timerPrintResults)

                    timerLoadGeneration = setInterval(() => {
                        t2 = Date.now()
                        if (t2 - t1 <= req.body['Duration']) {
                            sendRequestAxiosPost(urlBusyBox, t2, {
                                MessageType: 'Command',
                                NodeCommand: 'GenerateNumbers',
                                NumberOfPoints: req.body['NumberOfPoints']
                            })
                        } else {
                            console.log('    Data Generation => Finish')
                            clearInterval(timerLoadGeneration)
                        }
                    }, req.body['Interval'])

                    timerPrintResults = setInterval(() => {
                        t3 = Date.now()
                        x1 = arrResponses.filter(dp => (t3 - dp['TimeStamp'] <= 10000))
                        if (x1.length == 0) {
                            console.log('--------------------------------------------------')
                            console.log('No data to show')
                            console.log('--------------------------------------------------')
                            clearInterval(timerPrintResults)
                        } else {
                            x2 = x1.map(dp => dp['Response']['NodeIP'])
                            x2 = [... new Set(x2)]
                            x2.sort()
                            console.log('--------------------------------------------------')
                            x2.forEach(nodeIP => {
                                x3 = x1.filter(dp => dp['Response']['NodeIP'] == nodeIP)
                                x4 = 0
                                x3.forEach(dp => {
                                    x4 += dp['TotalDelay']
                                })
                                x4 /= x3.length
                                x4 = Math.round(x4)

                              
            

                        
                                x3 = `TotalDelay: ${x4}, NodeIP: ${nodeIP} timer :${t2 - t1}`
                                debug = execSync(`kubectl get pods`).toString()
                                //console.log(debug)
                                
                                  dataForGraph.push({
                                 'TotalDelay:': x4,
                                 'timer': t2 - t1,
                                 'nbReplica': debug})
                                if(req.body['TypeExperiment'] == "autoScale"){
                                    fs.writeFileSync('dataForGraph.json', JSON.stringify(dataForGraph, null, 4))
                                }
                                else if(req.body['TypeExperiment'] == "NOautoScale")
                                    fs.writeFileSync('dataForGraphwithoutAutoSclaling.json', JSON.stringify(dataForGraph, null, 4))

                                
                                if (x4 <= req.body['TargetDelay']) {
                                    console.log(colors.green(x3))
                                } else if (x4 <= req.body['TargetDelay'] * 1.5) {
                                    
                                    console.log(colors.yellow(x3))
                                } else {
                                    console.log(colors.red(x3))
                                }
                            })
                            console.log('--------------------------------------------------')
                        }
                    }, 1000)

                    break

                case 'SaveCollectedData':
                    x1 = JSON.stringify(arrResponses, null, 4)
                    fs.writeFileSync(req.body['FileName'], x1)

                    break
            }

            break

        default:
            ans += ` => Unknown Message Type => ${req.body['MessageType']} !!!`
    }

    res.json({ 'Message': ans })
})

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))