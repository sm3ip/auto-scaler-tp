//npm init --yes
//npm install express ip axios fs child_process


const express = require('express')
const ip = require("ip")
const fs = require('fs')

const { execSync } = require('child_process')

const app = express()
const ipAddress = ip.address()
const ipPort = 5000

let dataCollectedResults = []
let dataLookupTable = []

app.use(express.json({
    inflate: true,
    limit: '100kb',
    reviver: null,
    strict: true,
    type: 'application/json',
    verify: undefined
}))

///////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.send(`
    <h1>Simple AutoScaler</h1>
    <p>&nbsp;</p>
    <h2>Use JSON commands to auto-scale the deployment</h2>
    `)
})

///////////////////////////////////////////////////////////////////////////////
app.post('/json', (req, res) => {
    let ans = ""
    let jsonAnalysisFiles

    let x1, x2, x3, x4
    let rn, ri

    switch (req.body['MessageType']) {
        case 'Command':
            ans = `Execute:${req.body['NodeCommand']}`
            switch (req.body['NodeCommand']) {
                case 'BuildLookupTable':
                    jsonAnalysisFiles = fs.readdirSync('./collected-profiles').filter(fn => fn.endsWith('-summary.json'))

                    jsonAnalysisFiles.forEach(fn => {
                        x1 = fn.split('-')
                        rn = Number(x1[1])
                        ri = Number(x1[2])

                        x1 = JSON.parse(fs.readFileSync(`./collected-profiles/${fn}`))

                        x2 = 0
                        x3 = 0
                        x1.forEach(dp => {
                            x2 += dp['CalculationTime']
                            x3 += dp['TotalDelay']
                        })
                        x2 /= x1.length
                        x3 /= x1.length

                        dataCollectedResults.push({
                            'Replicas': rn,
                            'RequestInterval': ri,
                            'CalculationTime': x2,
                            'TotalDelay': x3
                        })
                    })

                    fs.writeFileSync('collected-data.json', JSON.stringify(dataCollectedResults, null, 4))

                    dataCollectedResults.forEach(dp => {
                        //ans+= `request interval dp : ${dp['RequestInterval']}  \n`
                        //ans+= `TotalDelay dp : ${dp['TotalDelay']}  \n`
                        x2 = dataCollectedResults.filter(xx => (xx['RequestInterval'] <= dp['RequestInterval']))
                        
                        //x2.forEach(xx => ans+= `request interval xx : ${xx['RequestInterval']} :  NRéplica : ${xx['Replicas']}  \n`)
                        
                        x2 = x2.filter(xx => xx['TotalDelay'] <= dp['TotalDelay'])

                        //x2.forEach(xx => ans+= `totDelay xx : ${xx['TotalDelay']} :  NRéplica : ${xx['Replicas']}  \n`)

                        
                        x3 = x2.map(xx => xx['Replicas'])
                        x3 = Math.min(...x3)

                        dataLookupTable.push({
                            'RequestInterval': dp['RequestInterval'],
                            'TotalDelay': dp['TotalDelay'],
                            'Replicas': dp['Replicas'],
                            'LookupTable': x3
                        })
                    })

                    fs.writeFileSync('lookup-table-data.json', JSON.stringify(dataLookupTable, null, 4))

                    break

                case 'AutoScale':
                    fic = JSON.parse(fs.readFileSync(`lookup-table-data.json`))
                    requestInterval = req.body['RequestInterval']
                    ans += `inter  : ${requestInterval}\n`
                    filtreChargeCluster = fic.filter(xx=> xx["RequestInterval"] == requestInterval)
                    ans += `charche  : ${filtreChargeCluster} \n`

                    replicatCharge = filtreChargeCluster.map(xx => xx["LookupTable"])
                    replicatCharge.forEach(xx => ans+= `xx = ${xx} \n`)
                    x3 = Math.max(...replicatCharge)
                   
                    //filter1 = fic.filter(yy=> )
                    ans+=  `x3 : ${x3}\n`
                 
                    ans += `Number of Replicas to reach TotalDelay of ${req.body['TotalDelay']} for RequestInterval of ${req.body['RequestInterval']} should be => ${x3} `
                    execSync(`kubectl scale --replicas=${x3} -f k8-tp-04-busy-box-deployment.yaml`)

                    break
            }

            break

        default:
            ans += ` => Unknown Message Type => ${req.body['MessageType']} !!!`
    }

    res.json({ 'Message': ans })
})

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))
