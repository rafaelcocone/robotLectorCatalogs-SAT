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
        
        for (let d = 27 ; d < divisionesData.length; d++){
            //let d = 1
            //console.log(divisionesData[d])
            console.log('divisiones=================================='+divisionesData[d][1])
            division = grupo.divisiones[divisionesData[d][0]] !== undefined ?
                                grupo.divisiones[divisionesData[d][0]] :
                                {
                                    claveDivision : divisionesData[d][0],
                                    descripcionDivision : divisionesData[d][1],
                                    familias : {}
                                }
            
            //familia
            await page.select('select[name="cmbSegmento"]',division.claveDivision.toString());  
           
            await page.waitForTimeout(3000)  
            await page.waitForSelector('select[name="cmbFamilia"] option')
            const familiasData = await page.evaluate(() => Array.from(document.querySelectorAll('select[name="cmbFamilia"] option'), element => [element.value, element.textContent]))
            for (let f = 1 ; f < familiasData.length; f++){
                console.log('familias=================================='+familiasData[f][1])    
                //console.log(familiasData[f])
                familia =  division.familias[familiasData[f][0]] !== undefined ? 
                                    division.familias[familiasData[f][0]] : 
                                    {
                                        claveFamilia : familiasData[f][0],
                                        descripcionFamilia : familiasData[f][1],
                                        clases : {}
                                    } 
                                    
                //clases
                console.log('clases==================================')  
                await page.select('select[name="cmbFamilia"]', familia.claveFamilia.toString());  
                
                await page.waitForTimeout(3000)
                await page.waitForSelector('select[name="cmbClase"] option')
                const clasesData = await page.evaluate(() => Array.from(document.querySelectorAll('select[name="cmbClase"] option'), element => [element.value, element.textContent]))
                for(let c = 1; c < clasesData.length; c++){
                    console.log('familias=================================='+clasesData[c][1])   
                    if(familia.clases[clasesData[c][0]] === undefined)
                        familia.clases[clasesData[c][0]] = {
                            claveClase : clasesData[c][0],
                            descripcionClase : clasesData[c][1],
                            detallados : []
                        }
                }//for clases

                await page.waitForSelector('select[name="cmbClase"] option')
                await page.click("#btnBuscar")
                await page.waitForSelector('#myTreen0Nodes')
                await page.waitForTimeout(10000)
                await page.screenshot({path:'catalogo.jpg', fullPage: true})
                const clavesDetalladas = await page.evaluate(() => Array.from(document.querySelectorAll('.myTree_0'), element =>  element.textContent ) )
                            
                for(let clave of clavesDetalladas ){
                    if(clave.includes('-',9) && clave.indexOf('-') === 9 ){
                        
                        claseClave = clave.substring(0,6)
                                        .trim()
                        claveDetallado =    clave.substring(0,8)
                                            .trim()
                        descripcionDertallado =  clave.substring(10)
                                                .trim()

                        let existe = false

                        familia.clases[claseClave].detallados.forEach(element => {
                            if(element.descripcion ===  descripcionDertallado )
                                existe = true;


                        })

                        if(!existe)
                            familia.clases[claseClave].detallados.push({
                                clave: claveDetallado, 
                                descripcion: descripcionDertallado 
                            })
                        
                    }

                }
                //console.log(Object.values(familia.clases['501515'] ))
                //console.log(Object.values(familia.clases['501516']))
                division.familias[familia.claveFamilia] = familia
            }
            //console.log('dicision==================================')
           
            //console.log(Object.values(division))
            grupo.divisiones[division.claveDivision] = division
        }   
        //console.log('grupos==================================')
       
        //console.log(Object.values(grupo))
    
    //console.log('guiasClaves==================================')
         guiasClaves[grupo.claveGrupo] = grupo
    //console.log(Object.values(guiasClaves))

    // await page.screenshot({path:'catalogo.jpg', fullPage: true})

    }catch(e){
        console.log(e)
        console.log(familia)
        console.log(Object.values(familia))
        console.log('familia final==================================')
        division.familias[familia.claveFamilia] = familia
        console.log('division final==================================')
        console.log(Object.values(division))
        grupo.divisiones[division.claveDivision] = division
        console.log('grupos final==================================')
        console.log(Object.values(grupo))
        guiasClaves[grupo.claveGrupo] = grupo
        

    }finally{
        const jsonclaves = JSON.stringify(guiasClaves)
        fs.writeFileSync('claveSAT.json',jsonclaves,'utf-8')
        await browser.close()
        
    }

  







    


    //await page.screenshot({path:'catalogo.jpg'})

    
}) ();

