const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const config = require('config')
const { apiGet, apiPost, writeToFile } = require('./shopifyApi')

const args = process.argv.slice(2);
const action = args[0]

const getData = (auth, product_id) => {
  const productId = product_id
  apiGet(auth, `products/${product_id}/metafields.json`)
    .then((resp) => {
      // console.log(resp)
      writeToFile(resp, `./files/metafields-${product_id}.json`)
      console.log('Metafields data has been saved to /files/metafields-${product_id}.json')
      console.log('Total:', resp.metafields.length)
      console.log('To post te metafields to other product, run: npm run metafields post <file> <storeAuth> <productId>')
      // postData(4626627199011, resp)
    })
    .catch((err) => { 
      console.log(err)
    })
}

const postData = (auth, product_id, metafields) => {
  let count = 0
  let errorsCount = 0
  apiGet(auth, `products/${product_id}/metafields.json`)
    .then((resp) => {
      const origmf = resp.metafields

      _.forEach(metafields.metafields, (metafield) => {
        isExist = origmf.find((obj, index) => {
          return obj.namespace == metafield.namespace && obj.key == metafield.key
        })
        
        if (typeof isExist != 'object') {
          const newData = {
            'metafield': {
              'namespace': metafield.namespace,
              'key': metafield.key,
              'value': metafield.value,
              'value_type': metafield.value_type
            }
          }
          apiPost(auth, `products/${product_id}/metafields.json`, newData)
            .then((resp) => {
              count += 1
              console.log('metafield created:', resp)
              console.log('errors:', errorsCount)
              console.log('metafields count:', count)
            })
            .catch((err) => {
              errorsCount += 1
              console.log('post error ', newData.key)
            })
        }
        
      })
    })
}

if (action == 'get' || action == 'post' || action == 'migrate') {
  if (action == 'get') {
    const store = args[1]
    const auth = _.get(config, store)
    const productId = args[2]

    if (_.isEmpty(auth)) {
      console.log(`No authentications set for ${auth} (origin store)`);
      process.exit(1);
    }

    if (_.isEmpty(productId)) {
      console.log(`No Product Id`);
      process.exit(1);
    }

    getData(auth, productId)
  }

  if (action == 'post') {
    const store = args[2]
    const auth = _.get(config, store)
    const productId = args[3]
    const pathToFile = args[1] || '';

    const fileContent = JSON.parse(fs.readFileSync(pathToFile, { encoding: 'utf-8' }));
    
    if (_.isEmpty(auth)) {
      console.log(`No authentications set for ${auth} (origin store)`);
      process.exit(1);
    }

    if (_.isEmpty(productId)) {
      console.log(`No Product Id`);
      process.exit(1);
    }

    postData(auth, productId, fileContent)
    
  }
} else {
  console.log(`action must be get, post or migrate`);
  process.exit(1);
}
