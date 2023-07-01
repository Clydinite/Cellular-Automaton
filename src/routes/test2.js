function parse(program) {
    const tokens = program
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .trim()
        .split(/\s+/);

    return parseTokens(tokens);
}

function parseTokens(tokens) {
    if (tokens.length === 0) {
        throw new Error('Unexpected EOF');
    }

    const token = tokens.shift();

    if (token === '(') {
        const expression = [];

        while (tokens[0] !== ')') {
            expression.push(parseTokens(tokens));
        }

        tokens.shift(); // Remove the closing ')'

        return expression;
    } else if (token === ')') {
        throw new Error('Unexpected ")"');
    } else {
        return atom(token);
    }
}

function atom(token) {
    const num = parseFloat(token);

    if (!isNaN(num)) {
        return num;
    } else {
        return token;
    }
}

function generateIndent(depth) {
    return '  '.repeat(depth);
}

function transpile(ast, depth = 0) {
    if (Array.isArray(ast)) {
        const [head, ...rest] = ast;

        if (head === 'if') {
            const [test, consequent, alternate] = rest;
            const testCode = transpile(test, depth);
            const consequentCode = transpile(consequent, depth + 1);
            const alternateCode = transpile(alternate, depth + 1);

            return `${generateIndent(depth)}if (${testCode}) {\n${consequentCode}\n${generateIndent(depth)}} else {\n${alternateCode}\n${generateIndent(depth)}}`;
        } else if (head === 'var') {
            const [identifier, value] = rest;
            const valueCode = transpile(value, depth);

            return `${generateIndent(depth)}const ${identifier} = ${valueCode};`;
        } else if (head === 'repeat') {
            const [count, ...body] = rest;
            const countCode = transpile(count, depth);
            const bodyCode = body.map((expr) => transpile(expr, depth + 1)).join('\n');

            return `${generateIndent(depth)}for (let i = 0; i < ${countCode}; i++) {\n${bodyCode}\n${generateIndent(depth)}}`;
        } else if (head === 'set') {
            const [identifier, value] = rest;
            const valueCode = transpile(value, depth);

            return `${generateIndent(depth)}${identifier} = ${valueCode};`;
        } else {
            throw new Error(`Unknown expression: ${head}`);
        }
    } else {
        return ast.toString();
    }
}


// Example usage
const program = `(if (> energy 50)
    ((var i 0)
      (repeat 4 (
        (if (f i) (
          (g i)
          (break)
        ))
        (set i (+ i 1))
      ))
    )
  )`;

const ast = parse(program);
const transpiledCode = transpile(ast);
console.log(transpiledCode);
