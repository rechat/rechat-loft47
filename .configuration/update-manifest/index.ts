import fs from 'fs-extra'
import path from 'path'

import manifest from '../../manifest.json'

export function main() {
  manifest.build = Math.floor(new Date().getTime() / 1000).toString()
  
  // Write to root
  fs.writeFileSync(
    path.resolve(__dirname, '../../manifest.json'), 
    JSON.stringify(manifest, null, 2)
  )
  
  // Also copy to dist-web for static serving
  fs.ensureDirSync(path.resolve(__dirname, '../../dist-web'))
  fs.writeFileSync(
    path.resolve(__dirname, '../../dist-web/manifest.json'), 
    JSON.stringify(manifest, null, 2)
  )
}

main()