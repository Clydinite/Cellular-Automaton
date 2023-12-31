function sample (list: any[]) {
    return list[Math.floor((Math.random() * list.length))];
}

function randomCode(): string[] {

    const arg0 = ['0', '1', '2', '3', '25', '50', '75', '100', 'random', 'empty', 'a', 'b', 'c', 'd', 'energy', 'color']
    const arg1 = ['transfer', 'attack', 'move', 'grow']
    const arg2 = ['var', 'set', 'if', 'loop', 'lookup', '>', '>=', '==', '<=', '<', '!=', 'and', 'or', 'xor', '+', '-', '*', '/', '%']

    const comparisons = ['>', '>=', '==', '<=', '<', '!=']

    const maxDepth = 3
    let maxArity = 2

    function buildExpression(depth: number, arity: number): string {
        const r = []
        do {
            if (depth >= maxDepth) {
                maxArity = 1
            }

            if (arity == 0) {
                r.push("'" + arg0[Math.floor(Math.random() * arg0.length)] + "'")
            } else if (arity == 1) {
                r.push("['" + arg1[Math.floor(Math.random() * arg1.length)] + "', " + buildExpression(depth + 1, Math.floor(Math.random() * (maxArity + 1))) + "]")
            } else {
                r.push("['" + arg2[Math.floor(Math.random() * arg2.length)] + "', " + buildExpression(depth + 1, Math.floor(Math.random() * (maxArity + 1))) + ", " + buildExpression(depth + 1, Math.floor(Math.random() * (maxArity + 1))) + "]")
            }


        } while (false) //(Math.random() * 100) > 50 && depth < maxDepth

        return r.join(', ')
    }

    function buildNumber(): string {

        if (Math.random() > 0.6) {
            const value = sample(['energy', 'color'])
             return `'lookup', ${sample(arg0)}, ${sample(value)}`
        } else {
            return sample(arg0)
        }

    }

    function buildCondition(): string {

        const operator = sample(comparisons)
        const left = buildNumber()
        const right = buildNumber()

        return `'${operator}', ${left}, ${right}`
    }

    console.log(buildCondition(), buildNumber())

    return eval(buildExpression(0, 2))
}

