const path = require('path');
const fs = require('fs');
const solc = require('solc');

function findImports(importPath) {
  try {
    if (importPath.startsWith('@openzeppelin')) {
      const nodeModulesPath = path.resolve(__dirname, 'node_modules', importPath);
      const content = fs.readFileSync(nodeModulesPath, 'utf8');
      return { contents: content };
    } else {
      const content = fs.readFileSync(path.resolve(__dirname, 'contracts', importPath), 'utf8');
      return { contents: content };
    }
  } catch (error) {
    console.error(`Error finding import: ${importPath}. File not found.`);
    return { error: 'File not found' };
  }
}

async function compileContract(contractName) {
  const contractPath = path.resolve(__dirname, 'contracts', `${contractName}.sol`);
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract source file not found: ${contractPath}`);
  }
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
      evmVersion: 'byzantium',
    },
  };

  return new Promise((resolve, reject) => {
    solc.loadRemoteVersion('v0.5.16+commit.9c3226ce', (err, solcSpecific) => {
      if (err) {
        console.error('Error loading solc compiler:', err);
        return reject(err);
      }

      const output = JSON.parse(solcSpecific.compile(JSON.stringify(input), { import: findImports }));

      if (output.errors) {
        let hasError = false;
        output.errors.forEach((error) => {
          if (error.severity === 'error') {
            hasError = true;
          }
          console.error(error.formattedMessage);
        });
        if (hasError) {
          return reject(new Error('Compilation failed due to errors.'));
        }
      }

      const contract = output.contracts[`${contractName}.sol`][contractName];
      if (!contract) {
        return reject(new Error(`Contract ${contractName} not found in the compiled output.`));
      }

      const buildPath = path.resolve(__dirname, 'build');
      if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath);
      }

      fs.writeFileSync(
        path.resolve(buildPath, `${contractName}.json`),
        JSON.stringify(contract, null, 2),
        'utf8'
      );

      console.log(`${contractName} compiled successfully.`);
      resolve(contract); // コンパイル結果を返す
    });
  });
}

// コンパイル処理の実行
(async () => {
  try {
    const contract = await compileContract('CypheriumBridgeTEST');
    console.log('Compiled contract ABI:', JSON.stringify(contract.abi, null, 2));
  } catch (error) {
    console.error('Compilation failed:', error.message);
    process.exit(1);
  }
})();
