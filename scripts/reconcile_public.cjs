const fs = require('fs');
const path = require('path');

const rootDirs = ['js', 'css', 'data', 'images', 'videos'];
const publicDir = path.join(__dirname, '../public');

rootDirs.forEach(dir => {
    const publicPath = path.join(publicDir, dir);
    const rootPath = path.join(__dirname, '..', dir);
    
    if (!fs.existsSync(publicPath)) return;
    
    const checkDir = (currPublic, currRoot) => {
        const files = fs.readdirSync(currPublic);
        files.forEach(file => {
            const p = path.join(currPublic, file);
            const r = path.join(currRoot, file);
            const statP = fs.statSync(p);
            
            if (statP.isDirectory()) {
                if (!fs.existsSync(r)) fs.mkdirSync(r, { recursive: true });
                checkDir(p, r);
            } else {
                if (!fs.existsSync(r)) {
                    console.log(`[MISSING IN ROOT] Copying ${p} -> ${r}`);
                    fs.copyFileSync(p, r);
                } else {
                    const statR = fs.statSync(r);
                    if (statP.mtime > statR.mtime) {
                        console.log(`[NEWER IN PUBLIC] Updating ${r} with ${p}`);
                        fs.copyFileSync(p, r);
                    }
                }
            }
        });
    };
    
    checkDir(publicPath, rootPath);
});

console.log('Reconciliation complete.');
