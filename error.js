const puppeteer = require('puppeteer');


( async ()  => {
    const fs = require('fs')
    const browser = await puppeteer.launch({headless:true})

    const page = await browser.newPage()

    await page.goto('http://pys.sat.gob.mx/PyS/catPyS.aspx')

    let variables = [ 
        {   tipo:1, division:1, familia:1, clase:1 }
    ]

    const jsonClaves = fs.readFileSync('claveSAT.json','utf-8')
    let guiasClaves = JSON.parse(jsonClaves)
    contador = 0;
    let grupo = {}, division = {}, familia = {}


    try{
        //tipos
        let g = 1;
        const tiposData = await page.evaluate(() => Array.from(document.querySelectorAll('select[name="cmbTipo"] option'), element => [element.value, element.textContent]))
        console.log('tipos================================== '+tiposData[g][1].toString())
        //console.log(tiposData[g])

        grupo = guiasClaves[tiposData[g][0]] !== undefined ? 
                        guiasClaves[tiposData[g][0]]:
                        {
                            claveGrupo : tiposData[g][0],
                            descripcionGrupo : tiposData[g][1],
                            divisiones : {}
                        }

       
        //divisiones
        await page.select('select[name="cmbTipo"]', tiposData[g][0].toString())
        
        await page.waitForTimeout(3000)
        await page.waitForSelector('select[name="cmbSegmento"] option')
        const divisionesData = await page.evaluate(() => Array.from(document.querySelectorAll('select[name="cmbSegmento"] option'), element => [element.value, element.textContent]))
        
        for (let d = 1 ; d < divisionesData.length; d++){
            //let d = 1
            //console.log(divisionesData[d])
            console.log(d+" "+divisionesData[d][0]+"=================================='+divisionesData[d][1])
        }
        

    }finally{
        const jsonclaves = JSON.stringify(guiasClaves)
        fs.writeFileSync('claveSAT.json',jsonclaves,'utf-8')
        await browser.close()
        
    }

  







    


    //await page.screenshot({path:'catalogo.jpg'})

    
}) ();

