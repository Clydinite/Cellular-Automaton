function transpile(ast) {
  if (ast.type === 'if') {
    const test = transpile(ast.test);
    const consequent = transpileBlock(ast.consequent);
    const alternate = transpileBlock(ast.alternate);
    return `if (${test}) ${consequent} else ${alternate}`;
  } else if (ast.type === 'binary') {
    const operator = ast.operator;
    const left = transpile(ast.left);
    const right = transpile(ast.right);
    return `${left} ${operator} ${right}`;
  } else if (ast.type === 'var') {
    const identifier = ast.identifier;
    const value = transpile(ast.value);
    return `const ${identifier} = ${value};`;
  } else if (ast.type === 'set') {
    const identifier = ast.identifier;
    const value = transpile(ast.value);
    return `${identifier} = ${value};`;
  } else if (ast.type === 'repeat') {
    const count = ast.count;
    const body = transpileBlock(ast.body);
    return `for (let i = 0; i < ${count}; i++) ${body}`;
  } else if (ast.type === 'function') {
    const name = ast.name;
    const args = ast.arguments.map(transpile).join(', ');
    return `${name}(${args})`;
  } else {
    return ast.toString();
  }
}

function transpileBlock(statements) {
  const transpiledStatements = statements.map(transpile).join('\n');
  return `{\n${transpiledStatements}\n}`;
}

const program = `\
(if (> energy 50)
  (
    (var i 0)
    (repeat 4 (
      (if (f i) (
        (g i)
        (break)
      ))
      (set i (+ i 1))
    ))
  )
)
`;


const ast = {
  type: 'if',
  test: {
    type: 'binary',
    operator: '>',
    left: 'energy',
    right: 50
  },
  consequent: [
    {
      type: 'block',
      body: [
        {
          type: 'var',
          identifier: 'i',
          value: 0
        },
        {
          type: 'repeat',
          count: 4,
          body: [
            {
              type: 'if',
              test: {
                type: 'function',
                name: 'f',
                arguments: ['i']
              },
              consequent: [
                {
                  type: 'function',
                  name: 'g',
                  arguments: ['i']
                },
                'break'
              ],
              alternate: []
            },
            {
              type: 'set',
              identifier: 'i',
              value: {
                type: 'binary',
                operator: '+',
                left: 'i',
                right: 1
              }
            }
          ]
        }
      ]
    }
  ],
  alternate: []
};

const jsCode = transpile(ast);
console.log(jsCode);

function g(d){
  console.log('g', d)
}

function f(d){
  console.log('f', d)
  return true

}

var energy = 2
